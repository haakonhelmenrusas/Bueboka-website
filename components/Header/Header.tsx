'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CircleUserRound, LogOut, Menu, MoreVertical, X } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const { data: session } = useSession();
	const router = useRouter();
	const menuRef = useRef<HTMLDivElement | null>(null);

	const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
	const closeMobileMenu = () => setMobileMenuOpen(false);

	const toggleProfileMenu = () => setProfileMenuOpen((v) => !v);
	const closeProfileMenu = () => setProfileMenuOpen(false);

	const handleLogout = async () => {
		try {
			await signOut();
			closeProfileMenu();
			closeMobileMenu();
			// navigate to front page after logout
			router.push('/');
		} catch (err) {
			Sentry.captureException(err, {
				tags: { action: 'logout' },
				extra: { message: 'Logout failed' },
			});
			console.error('Logout failed', err);
		}
	};

	const handleLogoClick = (e: React.MouseEvent) => {
		if (typeof window === 'undefined') return;

		const currentUrl = window.location.href;
		const targetUrl = window.location.origin + window.location.pathname;

		if (currentUrl === targetUrl) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// Close on Escape and trap focus within menu when open
	useEffect(() => {
		if (!profileMenuOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeProfileMenu();
			}

			if (e.key === 'Tab') {
				// focus trap
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
				closeProfileMenu();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('mousedown', onClickOutside);

		// focus first focusable inside menu after open
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
	}, [profileMenuOpen]);

	return (
		<header className={`${styles.header} ${styles.headerEnter}`}>
			<div className={styles.container}>
				<div className={styles.row}>
					<Link href="/" onClick={handleLogoClick} className={styles.logoLink}>
						<div className={styles.logoBox}>
							<Image width={24} height={24} priority src="/assets/logo.png" alt="Bueboka Logo" className={styles.logoImg} />
						</div>
						<span className={styles.brand}>Bueboka</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className={styles.desktopNav} aria-label="Primary">
						<Link href="#features" className={styles.navLink}>
							Funksjoner
						</Link>
						<Link href="#team" className={styles.navLink}>
							Team
						</Link>
						<Link href="#sponsors" className={styles.navLink}>
							Sponsorer
						</Link>
						<Link href="#contact" className={styles.navLink}>
							Kontakt
						</Link>
						{session?.user ? (
							<div className={styles.profileMenuWrapper}>
								<Link href="/min-side" className={styles.navLink} aria-label="Go to dashboard">
									{session.user.image ? (
										<Image
											src={session.user.image}
											alt={session.user.name || 'User avatar'}
											width={32}
											height={32}
											className={styles.userAvatar}
										/>
									) : (
										<CircleUserRound />
									)}
								</Link>
								<button
									className={styles.profileMenuButton}
									onClick={toggleProfileMenu}
									aria-haspopup="true"
									aria-expanded={profileMenuOpen}
									aria-controls="profile-menu"
								>
									<MoreVertical />
								</button>
							</div>
						) : (
							<div className={styles.authButtons}>
								<Link href="/logg-inn" className={styles.authButton}>
									Logg inn
								</Link>
								<Link href="/ny-bruker" className={styles.authButton}>
									Opprett bruker
								</Link>
							</div>
						)}
					</nav>

					{/* Mobile Menu Button */}
					<button
						onClick={toggleMobileMenu}
						className={styles.mobileButton}
						aria-label="Toggle mobile menu"
						aria-expanded={mobileMenuOpen}
						aria-controls="mobile-menu"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>

					{/* Profile menu dropdown (rendered here so it can be used on mobile and desktop) */}
					{session?.user && (
						<div className={styles.profileMenuContainer}>
							{/* Mobile-only profile button (visible on small screens) */}
							<button
								className={`${styles.profileMenuButton} ${styles.mobileProfileButton}`}
								onClick={toggleProfileMenu}
								aria-haspopup="true"
								aria-expanded={profileMenuOpen}
							>
								<MoreVertical />
							</button>

							{profileMenuOpen && (
								<div id="profile-menu" ref={menuRef} className={styles.profileMenu} role="menu">
									<button className={styles.profileMenuItem} onClick={handleLogout} role="menuitem">
										<LogOut size={16} />
										<span>Logg ut</span>
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Mobile Navigation */}
				<nav id="mobile-menu" className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ''}`}>
					<div className={styles.mobileLinks}>
						<Link href="#features" onClick={closeMobileMenu} className={styles.mobileLink}>
							Funksjoner
						</Link>
						<Link href="#team" onClick={closeMobileMenu} className={styles.mobileLink}>
							Team
						</Link>
						<Link href="#sponsors" onClick={closeMobileMenu} className={styles.mobileLink}>
							Sponsorer
						</Link>
						<Link href="#contact" onClick={closeMobileMenu} className={styles.mobileLink}>
							Kontakt
						</Link>
						{session?.user ? (
							<>
								<Link href="/min-side" onClick={closeMobileMenu} className={styles.mobileLink}>
									Min side
								</Link>
								{/* Mobile logout removed; use profile dropdown (mobileProfileButton) to log out */}
							</>
						) : (
							<>
								<Link href="/logg-inn" onClick={closeMobileMenu} className={styles.mobileLink}>
									Logg inn
								</Link>
								<Link href="/ny-bruker" onClick={closeMobileMenu} className={styles.mobileLink}>
									Opprett bruker
								</Link>
							</>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
}
