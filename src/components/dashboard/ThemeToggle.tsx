"use client"

import { useEffect, useState } from "react"
import styles from "./ThemeToggle.module.css"

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        // Cargar tema desde localStorage
        const saved = localStorage.getItem('mydigitable-theme') as 'light' | 'dark' | null
        if (saved) {
            setTheme(saved)
            document.documentElement.setAttribute('data-theme', saved)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('mydigitable-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggle}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    )
}
