// Re-export all types from database
export * from './database';

// Additional utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Form states
export interface FormState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

// Modal states
export interface ModalState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    data?: any;
}

// Table sorting
export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

// Filters
export interface FilterConfig {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: any;
}

// Language
export type Language = 'es' | 'en';

// Theme
export interface ThemeConfig {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    borderRadius: string;
}
