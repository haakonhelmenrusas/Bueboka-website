'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light');
	const [mounted, setMounted] = useState(false);

	// Load theme from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') as Theme | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		// Priority: localStorage > system preference > default (light)
		const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
		setTheme(initialTheme);
		setMounted(true);
	}, []);

	// Apply theme to document
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		root.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	// Prevent flash of unstyled content
	if (!mounted) {
		return null;
	}

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
