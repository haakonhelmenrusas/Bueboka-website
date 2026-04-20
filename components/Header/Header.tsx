'use client';

import React, { useCallback, useRef, useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { useClickOutside, useEscapeKey, useFocusTrap } from '@/lib/hooks';
import { useFeedback } from '@/context/FeedbackProvider';
import { LuActivity, LuLogOut, LuMenu, LuMessageSquare, LuSettings, LuCalculator, LuUser, LuUsers, LuX } from 'react-icons/lu';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const { openFeedback } = useFeedback();
	const { data: session } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const menuRef = useRef<HTMLDivElement>(null);

	// Check if we're on an authenticated page
	const isAuthPage =
		pathname === '/min-side' ||
		pathname === '/settings' ||
		pathname === '/statistikk' ||
		pathname === '/achievements' ||
		pathname === '/skyttere' ||
		pathname === '/siktemerker' ||
		pathname === '/aktivitet' ||
		pathname.startsWith('/profil/');

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
			console.error('Logout failed', err);
		}
	};

	const handleSettingsClick = () => {
		router.push('/settings');
		closeProfileMenu();
		closeMobileMenu();
	};

	const handleFeedbackClick = () => {
		openFeedback();
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
								<Link href="#community" onClick={(e) => handleHashLinkClick(e, '#community')} className={styles.navLink}>
									Felleskap
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.navLink}>
									Team
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.navLink}>
									Støtt oss
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
											<LuUser size={32} />
										)}
									</Link>
								)}
								<Link
									href="/aktivitet"
									className={`${styles.navLink} ${styles.navLinkIcon} ${pathname === '/aktivitet' ? styles.navLinkActive : ''}`}
								>
									<LuActivity size={16} />
									Aktivitet
								</Link>
								<Link
									href="/skyttere"
									className={`${styles.navLink} ${styles.navLinkIcon} ${pathname === '/skyttere' || pathname.startsWith('/skyttere/') ? styles.navLinkActive : ''}`}
								>
									<LuUsers size={16} />
									Skyttere
								</Link>
								<Link
									href="/siktemerker"
									className={`${styles.navLink} ${styles.navLinkIcon} ${pathname === '/siktemerker' ? styles.navLinkActive : ''}`}
								>
									<LuCalculator size={16} />
									Siktemerker
								</Link>
								<button className={`${styles.navButton} ${styles.navLinkIcon}`} onClick={handleFeedbackClick}>
									<LuMessageSquare size={16} />
									Tilbakemelding
								</button>
								<button
									aria-label="Åpne profil menu"
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
									<Link href="/ny-bruker" className={styles.authButtonPrimary}>
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
							{mobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
						</button>
					)}
					{session?.user && (
						<div className={styles.profileMenuContainer}>
							<button
								className={`${styles.profileMenuButton} ${styles.mobileProfileButton} ${profileMenuOpen ? styles.hamburgerOpen : ''}`}
								onClick={toggleProfileMenu}
								aria-labelledby="Åpne profil menu"
								aria-haspopup="true"
								aria-expanded={profileMenuOpen}
							>
								<span className={styles.hamburgerBox}>
									<span className={styles.hamburgerInner} />
								</span>
							</button>
							{profileMenuOpen && (
								<div id="profile-menu" ref={menuRef} className={styles.profileMenu} role="menu">
									<div className={styles.profileMenuNavSection}>
										<Link href="/aktivitet" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
											<LuActivity size={16} />
											<span>Aktivitet</span>
										</Link>
										<Link href="/skyttere" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
											<LuUsers size={16} />
											<span>Skyttere</span>
										</Link>
										<Link href="/siktemerker" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
											<LuCalculator size={16} />
											<span>Siktemerker</span>
										</Link>
										<button className={styles.profileMenuItem} onClick={handleFeedbackClick} role="menuitem">
											<LuMessageSquare size={16} />
											<span>Tilbakemelding</span>
										</button>
										<div className={styles.profileMenuDivider} role="separator" />
									</div>
									<button className={styles.profileMenuItem} onClick={handleSettingsClick} role="menuitem">
										<LuSettings size={16} />
										<span>Innstillinger</span>
									</button>
									<button className={styles.profileMenuItem} onClick={handleLogout} role="menuitem">
										<LuLogOut size={16} />
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
								<Link href="#community" onClick={(e) => handleHashLinkClick(e, '#community')} className={styles.mobileLink}>
									Felleskap
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.mobileLink}>
									Team
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.mobileLink}>
									Støtt oss
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
								<Link href="/aktivitet" onClick={closeMobileMenu} className={`${styles.mobileLink} ${styles.mobileLinkIcon}`}>
									<LuActivity size={16} />
									Aktivitet
								</Link>
								<Link href="/skyttere" onClick={closeMobileMenu} className={`${styles.mobileLink} ${styles.mobileLinkIcon}`}>
									<LuUsers size={16} />
									Skyttere
								</Link>
								<Link href="/siktemerker" onClick={closeMobileMenu} className={`${styles.mobileLink} ${styles.mobileLinkIcon}`}>
									<LuCalculator size={16} />
									Siktemerker
								</Link>
								<button className={`${styles.mobileLinkButton} ${styles.mobileLinkIcon}`} onClick={handleFeedbackClick}>
									<LuMessageSquare size={16} />
									Tilbakemelding
								</button>
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
