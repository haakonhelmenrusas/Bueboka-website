'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className={styles.toggle}
			aria-label={theme === 'light' ? 'Bytt til mørk modus' : 'Bytt til lys modus'}
			title={theme === 'light' ? 'Bytt til mørk modus' : 'Bytt til lys modus'}
			role="menuitem"
		>
			{theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
			<span>{theme === 'light' ? 'Lys modus' : 'Mørk modus'}</span>
		</button>
	);
}
