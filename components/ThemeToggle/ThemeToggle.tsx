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
		>
			<div className={styles.iconWrapper}>
				<Sun className={`${styles.icon} ${styles.sun} ${theme === 'light' ? styles.active : ''}`} size={16} />
				<Moon className={`${styles.icon} ${styles.moon} ${theme === 'dark' ? styles.active : ''}`} size={16} />
			</div>
			<span className={styles.label}>{theme === 'light' ? 'Lys' : 'Mørk'}</span>
		</button>
	);
}
