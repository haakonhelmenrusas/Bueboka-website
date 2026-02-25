'use client';

import React, { useCallback, useRef, useState } from 'react';
import { CircleUserRound, LogOut, Menu, Settings, X } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
// import { ThemeToggle } from '@/components';
import { useClickOutside, useEscapeKey, useFocusTrap } from '@/lib/hooks';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const { data: session } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const menuRef = useRef<HTMLDivElement>(null);

	// Check if we're on an authenticated page
	const isAuthPage = pathname === '/min-side' || pathname === '/settings' || pathname === '/statistikk';

	// Check if we're on an auth form page (login/signup)
	const isAuthFormPage =
		pathname === '/logg-inn' || pathname === '/ny-bruker' || pathname === '/glemt-passord' || pathname === '/tilbakestill-passord';

	// Determine logo destination
	const logoHref = isAuthFormPage ? '/' : session?.user ? '/min-side' : '/';

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

	const handleSettingsClick = () => {
		router.push('/settings');
		closeProfileMenu();
		closeMobileMenu();
	};

	const handleLogoClick = (e: React.MouseEvent) => {
		// Only prevent default navigation if we're on the homepage and trying to go to homepage
		// This allows smooth scrolling on homepage, but normal navigation from auth pages
		if (pathname === '/' && logoHref === '/') {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		// For all other cases (like /logg-inn -> /), let the normal Link navigation happen
	};

	const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
		// Only prevent default if we're already on the homepage
		if (pathname === '/') {
			e.preventDefault();
			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
		closeMobileMenu();
	};

	// Use custom hooks for better separation of concerns
	const handleClickOutside = useCallback(() => {
		closeProfileMenu();
	}, []);

	const handleEscapeKey = useCallback(() => {
		closeProfileMenu();
	}, []);

	useClickOutside(menuRef, handleClickOutside, profileMenuOpen);
	useEscapeKey(handleEscapeKey, profileMenuOpen);
	useFocusTrap(menuRef, profileMenuOpen, true);

	return (
		<header className={`${styles.header} ${styles.headerEnter}`}>
			<div className={styles.container}>
				<div className={styles.row}>
					<Link href={logoHref} onClick={handleLogoClick} className={styles.logoLink}>
						<div className={styles.logoBox}>
							<Image width={24} height={24} priority src="/assets/logo.png" alt="Bueboka Logo" className={styles.logoImg} />
						</div>
						<span className={styles.brand}>Bueboka</span>
					</Link>
					<nav className={styles.desktopNav} aria-label="Primary">
						{!isAuthPage && (
							<>
								<Link href="#features" onClick={(e) => handleHashLinkClick(e, '#features')} className={styles.navLink}>
									Funksjoner
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.navLink}>
									Team
								</Link>
								<Link href="#sponsors" onClick={(e) => handleHashLinkClick(e, '#sponsors')} className={styles.navLink}>
									Sponsorer
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.navLink}>
									Kontakt
								</Link>
							</>
						)}
						{session?.user ? (
							<div className={styles.profileMenuWrapper}>
								{!isAuthPage && (
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
								)}
								<button
									className={`${styles.profileMenuButton} ${profileMenuOpen ? styles.hamburgerOpen : ''}`}
									onClick={toggleProfileMenu}
									aria-haspopup="true"
									aria-expanded={profileMenuOpen}
									aria-controls="profile-menu"
								>
									<span className={styles.hamburgerBox}>
										<span className={styles.hamburgerInner} />
									</span>
								</button>
							</div>
						) : (
							!isAuthPage && (
								<div className={styles.authButtons}>
									<Link href="/logg-inn" className={styles.authButton}>
										Logg inn
									</Link>
									<Link href="/ny-bruker" className={styles.authButton}>
										Opprett bruker
									</Link>
								</div>
							)
						)}
					</nav>
					{!session?.user && (
						<button
							onClick={toggleMobileMenu}
							className={styles.mobileButton}
							aria-label="Toggle mobile menu"
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					)}
					{session?.user && (
						<div className={styles.profileMenuContainer}>
							<button
								className={`${styles.profileMenuButton} ${styles.mobileProfileButton} ${profileMenuOpen ? styles.hamburgerOpen : ''}`}
								onClick={toggleProfileMenu}
								aria-haspopup="true"
								aria-expanded={profileMenuOpen}
							>
								<span className={styles.hamburgerBox}>
									<span className={styles.hamburgerInner} />
								</span>
							</button>
							{profileMenuOpen && (
								<div id="profile-menu" ref={menuRef} className={styles.profileMenu} role="menu">
									{/* <ThemeToggle /> */}
									<button className={styles.profileMenuItem} onClick={handleSettingsClick} role="menuitem">
										<Settings size={16} />
										<span>Innstillinger</span>
									</button>
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
						{!isAuthPage && (
							<>
								<Link href="#features" onClick={(e) => handleHashLinkClick(e, '#features')} className={styles.mobileLink}>
									Funksjoner
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.mobileLink}>
									Team
								</Link>
								<Link href="#sponsors" onClick={(e) => handleHashLinkClick(e, '#sponsors')} className={styles.mobileLink}>
									Sponsorer
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.mobileLink}>
									Kontakt
								</Link>
							</>
						)}
						{session?.user ? (
							<>
								{!isAuthPage && (
									<Link href="/min-side" onClick={closeMobileMenu} className={styles.mobileLink}>
										Min side
									</Link>
								)}
							</>
						) : (
							!isAuthPage && (
								<>
									<Link href="/logg-inn" onClick={closeMobileMenu} className={styles.mobileLink}>
										Logg inn
									</Link>
									<Link href="/ny-bruker" onClick={closeMobileMenu} className={styles.mobileLink}>
										Opprett bruker
									</Link>
								</>
							)
						)}
					</div>
				</nav>
			</div>
		</header>
	);
}
