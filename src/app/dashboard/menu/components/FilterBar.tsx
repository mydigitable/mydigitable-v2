'use client'

import { Search, Grid3x3, List, SlidersHorizontal } from 'lucide-react'

type FilterBarProps = {
    searchQuery: string
    onSearchChange: (query: string) => void
    filterType: 'all' | 'assigned' | 'unassigned'
    onFilterChange: (filter: 'all' | 'assigned' | 'unassigned') => void
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
    counts: {
        all: number
        assigned: number
        unassigned: number
    }
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    filterType,
    onFilterChange,
    viewMode,
    onViewModeChange,
    counts,
}: FilterBarProps) {
    return (
        <div className="atelier-filter-bar">
            {/* Search */}
            <div className="atelier-search">
                <Search className="atelier-search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Filter Tabs */}
            <div className="atelier-filter-tabs">
                <button
                    onClick={() => onFilterChange('all')}
                    className={`atelier-filter-tab ${filterType === 'all' ? 'active' : ''}`}
                >
                    Todos ({counts.all})
                </button>
                <button
                    onClick={() => onFilterChange('assigned')}
                    className={`atelier-filter-tab ${filterType === 'assigned' ? 'active' : ''}`}
                >
                    Asignados ({counts.assigned})
                </button>
                <button
                    onClick={() => onFilterChange('unassigned')}
                    className={`atelier-filter-tab ${filterType === 'unassigned' ? 'active' : ''}`}
                >
                    Sin asignar ({counts.unassigned})
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 border-l pl-4" style={{ borderColor: 'var(--atelier-border)' }}>
                <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                            ? 'bg-[var(--atelier-accent-l)] text-[var(--atelier-accent)]'
                            : 'text-[var(--atelier-ink3)] hover:bg-[var(--atelier-surface)]'
                        }`}
                    title="Vista en cuadrícula"
                >
                    <Grid3x3 size={18} />
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                            ? 'bg-[var(--atelier-accent-l)] text-[var(--atelier-accent)]'
                            : 'text-[var(--atelier-ink3)] hover:bg-[var(--atelier-surface)]'
                        }`}
                    title="Vista en lista"
                >
                    <List size={18} />
                </button>
            </div>
        </div>
    )
}
