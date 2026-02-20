'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateThemeAction(themeId: string) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return { success: false, error: 'No autenticado' }
        }

        // Get restaurant
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (restaurantError || !restaurant) {
            return { success: false, error: 'Restaurante no encontrado' }
        }

        // Update theme
        const { error: updateError } = await supabase
            .from('restaurants')
            .update({ theme_id: themeId })
            .eq('id', restaurant.id)

        if (updateError) {
            console.error('Error updating theme:', updateError)
            return { success: false, error: 'Error al actualizar tema' }
        }

        revalidatePath('/menus-v2')
        return { success: true }
    } catch (error) {
        console.error('Error in updateThemeAction:', error)
        return { success: false, error: 'Error inesperado' }
    }
}
