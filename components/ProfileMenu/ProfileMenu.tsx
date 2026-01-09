'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import styles from './ProfileMenu.module.css';

export interface ProfileMenuProps {
	onLogout: () => Promise<void> | void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const toggle = () => setOpen((v) => !v);
	const close = () => setOpen(false);

	useEffect(() => {
		if (!open) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
			}

			if (e.key === 'Tab') {
				const el = menuRef.current;
				if (!el) return;
				const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		const onClickOutside = (ev: MouseEvent) => {
			const el = menuRef.current;
			if (!el) return;
			if (ev.target instanceof Node && !el.contains(ev.target)) {
				close();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('mousedown', onClickOutside);

		setTimeout(() => {
			const el = menuRef.current;
			if (!el) return;
			const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (focusable.length) focusable[0].focus();
		}, 0);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('mousedown', onClickOutside);
		};
	}, [open]);

	const handleLogout = async () => {
		try {
			await onLogout();
		} finally {
			close();
		}
	};

	return (
		<div className={styles.wrapper} ref={menuRef}>
			<button onClick={toggle} className={styles.menuButton} aria-label="Profile menu" aria-expanded={open}>
				<Menu size={24} />
			</button>

			{open && (
				<div className={styles.dropdown} role="menu">
					<button className={styles.item} onClick={handleLogout} role="menuitem">
						<LogOut size={18} />
						Logg ut
					</button>
				</div>
			)}
		</div>
	);
};
