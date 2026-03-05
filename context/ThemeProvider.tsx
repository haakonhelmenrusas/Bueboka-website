'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
	theme: Theme;
	// toggleTheme removed - will be added back when dark mode is implemented
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme: Theme = 'light';

	// Apply light theme to document
	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute('data-theme', 'light');
		// Clear any previously saved theme preference
		localStorage.removeItem('theme');
	}, []);

	return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
