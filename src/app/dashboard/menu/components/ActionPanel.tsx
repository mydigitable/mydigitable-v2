'use client'

import { DesignPanel } from './panels/DesignPanel'
import { ProductListPanel } from './panels/ProductListPanel'
import { EmptyPanel } from './panels/EmptyPanel'

export function ActionPanel({
    selection,
    menus,
    designConfig,
    themes,
    onMenusUpdate,
    onDesignUpdate,
}: any) {
    // Mostrar panel según selección
    if (selection.type === 'design') {
        return (
            <DesignPanel
                designConfig={designConfig}
                themes={themes}
                onChange={onDesignUpdate}
            />
        )
    }

    if (selection.type === 'category') {
        const menu = menus.find((m: any) => m.id === selection.menuId)
        const category = menu?.categories?.find((c: any) => c.id === selection.categoryId)

        return (
            <ProductListPanel
                category={category}
                menu={menu}
                designConfig={designConfig}
                onUpdate={onMenusUpdate}
            />
        )
    }

    return <EmptyPanel />
}
