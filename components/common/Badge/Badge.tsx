import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'training' | 'competition' | 'primary' | 'secondary' | 'ghost';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
	/** Visual style of the badge */
	variant?: BadgeVariant;
	/** Size preset */
	size?: BadgeSize;
	/** Optional leading icon */
	icon?: React.ReactNode;
	children: React.ReactNode;
	/** Extra class name for one-off layout overrides */
	className?: string;
	/** Render text in ALL-CAPS with wider letter-spacing */
	uppercase?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
	variant = 'default',
	size = 'md',
	icon,
	children,
	className,
	uppercase = false,
}) => (
	<span
		className={[styles.badge, styles[variant], styles[size], uppercase ? styles.uppercase : '', className ?? '']
			.filter(Boolean)
			.join(' ')}
	>
		{icon && (
			<span className={styles.icon} aria-hidden="true">
				{icon}
			</span>
		)}
		{children}
	</span>
);

