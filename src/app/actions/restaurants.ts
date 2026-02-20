'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRestaurantSettings(restaurantId: string, settings: {
    show_prep_times_globally?: boolean
    default_prep_time?: number
}) {
    try {
        const supabase = await createClient()

        // Verify ownership
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'No autenticado' }
        }

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, owner_id')
            .eq('id', restaurantId)
            .single()

        if (!restaurant || restaurant.owner_id !== user.id) {
            return { success: false, error: 'No autorizado' }
        }

        // Whitelist only allowed fields
        const updateData: Record<string, unknown> = {}
        if (settings.show_prep_times_globally !== undefined) {
            updateData.show_prep_times_globally = settings.show_prep_times_globally
        }
        if (settings.default_prep_time !== undefined) {
            updateData.default_prep_time = settings.default_prep_time
        }

        const { error } = await supabase
            .from('restaurants')
            .update(updateData)
            .eq('id', restaurantId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar configuración'
        return { success: false, error: errorMessage }
    }
}
