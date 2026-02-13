'use client';

import React, { useCallback, useRef, useState } from 'react';
import { LogOut, Menu, Settings } from 'lucide-react';
import styles from './ProfileMenu.module.css';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useClickOutside, useEscapeKey, useFocusTrap } from '@/lib/hooks';

export interface ProfileMenuProps {
	/** Optional override (useful in tests or special flows). */
	onLogout?: () => Promise<void> | void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const toggle = () => setOpen((v) => !v);
	const close = () => setOpen(false);

	// Use custom hooks for better separation of concerns
	const handleClickOutside = useCallback(() => {
		close();
	}, []);

	const handleEscapeKey = useCallback(() => {
		close();
	}, []);

	useClickOutside(menuRef, handleClickOutside, open);
	useEscapeKey(handleEscapeKey, open);
	useFocusTrap(menuRef, open, true);

	const handleLogout = async () => {
		try {
			if (onLogout) {
				await onLogout();
				return;
			}

			await signOut();
			router.push('/');
			router.refresh();
		} finally {
			close();
		}
	};

	const handleSettingsClick = () => {
		router.push('/settings');
		close();
	};

	return (
		<div className={styles.wrapper} ref={menuRef}>
			<button onClick={toggle} className={styles.menuButton} aria-label="Profile menu" aria-expanded={open}>
				<Menu size={24} />
			</button>

			{open && (
				<div className={styles.dropdown} role="menu">
					<button className={styles.item} onClick={handleSettingsClick} role="menuitem">
						<Settings size={18} />
						Innstillinger
					</button>
					<button className={styles.item} onClick={handleLogout} role="menuitem">
						<LogOut size={18} />
						Logg ut
					</button>
				</div>
			)}
		</div>
	);
};
