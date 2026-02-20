'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CategorySidebar } from './CategorySidebar'
import { ProductsGrid } from './ProductsGrid'
import { MobilePreview } from './MobilePreview'

type Menu = {
    id: string
    name: string
    type: string
    is_active: boolean
    schedule: any
    restaurant_id: string
}

type Category = {
    id: string
    name: string
    description?: string
    visible: boolean
    menu_id: string
    restaurant_id: string
    display_order: number
}

type Product = {
    id: string
    name: string
    description?: string
    price: number
    image_url?: string
    allergens: string[]
    labels: string[]
    is_available: boolean
    category_id: string
    restaurant_id: string
}

type Props = {
    menu: Menu
    restaurantId: string
    onBack: () => void
}

export function Scene2MenuBuilder({ menu, restaurantId, onBack }: Props) {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [stats, setStats] = useState({ categories: 0, products: 0 })
    const supabase = createClient()

    useEffect(() => {
        loadCategories()
        calculateStats()
    }, [menu.id])

    useEffect(() => {
        if (selectedCategory) {
            loadProducts()
        } else {
            setProducts([])
        }
    }, [selectedCategory])

    async function loadCategories() {
        const { data } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('menu_id', menu.id)
            .eq('restaurant_id', restaurantId)
            .order('display_order')

        if (data) {
            setCategories(data)
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0])
            }
        }
    }

    async function loadProducts() {
        if (!selectedCategory) return

        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', selectedCategory.id)
            .eq('restaurant_id', restaurantId)
            .order('display_order')

        if (data) {
            setProducts(data)
        }
    }

    async function calculateStats() {
        // Count categories
        const { data: cats } = await supabase
            .from('menu_categories')
            .select('id')
            .eq('menu_id', menu.id)
            .eq('restaurant_id', restaurantId)

        const categoryCount = cats?.length || 0

        // Count products
        let productCount = 0
        if (cats && cats.length > 0) {
            for (const cat of cats) {
                const { data: prods } = await supabase
                    .from('products')
                    .select('id')
                    .eq('category_id', cat.id)
                    .eq('restaurant_id', restaurantId)
                productCount += prods?.length || 0
            }
        }

        setStats({ categories: categoryCount, products: productCount })
    }

    function handleCategoryCreated() {
        loadCategories()
        calculateStats()
    }

    function handleCategoryDeleted() {
        setSelectedCategory(null)
        loadCategories()
        calculateStats()
    }

    function handleProductChanged() {
        loadProducts()
        calculateStats()
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Categories */}
            <CategorySidebar
                menu={menu}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onCategoryCreated={handleCategoryCreated}
                onCategoryDeleted={handleCategoryDeleted}
                onBack={onBack}
                restaurantId={restaurantId}
            />

            {/* Central Area - Products */}
            <ProductsGrid
                category={selectedCategory}
                products={products}
                onProductChanged={handleProductChanged}
                restaurantId={restaurantId}
                hasCategories={categories.length > 0}
            />

            {/* Right Panel - Mobile Preview */}
            <MobilePreview
                category={selectedCategory}
                products={products}
                stats={stats}
                menuActive={menu.is_active}
            />
        </div>
    )
}
