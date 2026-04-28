'use client';

import React, { useCallback, useRef, useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { useClickOutside, useEscapeKey, useFocusTrap } from '@/lib/hooks';
import { useFeedback } from '@/context/FeedbackProvider';
import { useTranslation } from '@/context/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { LuActivity, LuLogOut, LuMenu, LuMessageSquare, LuSettings, LuCalculator, LuUser, LuUsers, LuX } from 'react-icons/lu';

function MenuIcon({ open }: { open: boolean }) {
	return (
		<span className={styles.menuIcon} aria-hidden="true">
			<span className={`${styles.iconSlot} ${open ? styles.iconSlotHidden : ''}`}>
				<LuMenu size={18} />
			</span>
			<span className={`${styles.iconSlot} ${!open ? styles.iconSlotHidden : ''}`}>
				<LuX size={18} />
			</span>
		</span>
	);
}

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const { openFeedback } = useFeedback();
	const { t } = useTranslation();
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
		if (pathname === '/' && logoHref === '/') {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
		if (pathname === '/') {
			e.preventDefault();
			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
		closeMobileMenu();
	};

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
									{t['nav.community']}
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.navLink}>
									{t['nav.team']}
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.navLink}>
									{t['nav.support']}
								</Link>
							</>
						)}
						{session?.user ? (
							<div className={styles.profileMenuWrapper}>
								<button
									aria-label={t['nav.openProfileMenu']}
									className={styles.menuButton}
									onClick={toggleProfileMenu}
									aria-haspopup="true"
									aria-expanded={profileMenuOpen}
									aria-controls="profile-menu"
								>
									<MenuIcon open={profileMenuOpen} />
									<span className={styles.menuButtonLabel}>Meny</span>
								</button>
							</div>
						) : (
							!isAuthPage && (
								<div className={styles.authButtons}>
									<LanguageSwitcher />
									<Link href="/logg-inn" className={styles.authButton}>
										{t['nav.login']}
									</Link>
									<Link href="/ny-bruker" className={styles.authButtonPrimary}>
										{t['nav.register']}
									</Link>
								</div>
							)
						)}
					</nav>

					{!session?.user && (
						<button
							onClick={toggleMobileMenu}
							className={styles.mobileButton}
							aria-label={t['nav.toggleMobileMenu']}
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							{mobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
						</button>
					)}

					{session?.user && (
						<div className={styles.profileMenuContainer}>
							<button
								className={`${styles.menuButton} ${styles.mobileProfileButton}`}
								onClick={toggleProfileMenu}
								aria-label={t['nav.openProfileMenu']}
								aria-haspopup="true"
								aria-expanded={profileMenuOpen}
							>
								<MenuIcon open={profileMenuOpen} />
								<span className={styles.menuButtonLabel}>Meny</span>
							</button>

							{profileMenuOpen && (
								<div id="profile-menu" ref={menuRef} className={styles.profileMenu} role="menu">
									{!isAuthPage && (
										<Link href="/min-side" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
											<LuUser size={16} />
											<span>{t['nav.myPage']}</span>
										</Link>
									)}
									<Link href="/aktivitet" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
										<LuActivity size={16} />
										<span>{t['nav.activity']}</span>
									</Link>
									<Link href="/skyttere" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
										<LuUsers size={16} />
										<span>{t['nav.archers']}</span>
									</Link>
									<Link href="/siktemerker" onClick={closeProfileMenu} className={styles.profileMenuLink} role="menuitem">
										<LuCalculator size={16} />
										<span>{t['nav.sightMarks']}</span>
									</Link>
									<button className={styles.profileMenuItem} onClick={handleFeedbackClick} role="menuitem">
										<LuMessageSquare size={16} />
										<span>{t['nav.feedback']}</span>
									</button>
									<div className={styles.profileMenuDivider} role="separator" />
									<LanguageSwitcher variant="light" />
									<div className={styles.profileMenuDivider} role="separator" />
									<button className={styles.profileMenuItem} onClick={handleSettingsClick} role="menuitem">
										<LuSettings size={16} />
										<span>{t['nav.settings']}</span>
									</button>
									<button className={styles.profileMenuItem} onClick={handleLogout} role="menuitem">
										<LuLogOut size={16} />
										<span>{t['nav.logout']}</span>
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Mobile Navigation (unauthenticated only) */}
				<nav id="mobile-menu" className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ''}`}>
					<div className={styles.mobileLinks}>
						{!isAuthPage && (
							<>
								<Link href="#community" onClick={(e) => handleHashLinkClick(e, '#community')} className={styles.mobileLink}>
									{t['nav.community']}
								</Link>
								<Link href="#team" onClick={(e) => handleHashLinkClick(e, '#team')} className={styles.mobileLink}>
									{t['nav.team']}
								</Link>
								<Link href="#contact" onClick={(e) => handleHashLinkClick(e, '#contact')} className={styles.mobileLink}>
									{t['nav.support']}
								</Link>
							</>
						)}
						{!isAuthPage && (
							<>
								<LanguageSwitcher />
								<Link href="/logg-inn" onClick={closeMobileMenu} className={styles.mobileLink}>
									{t['nav.login']}
								</Link>
								<Link href="/ny-bruker" onClick={closeMobileMenu} className={styles.mobileLink}>
									{t['nav.register']}
								</Link>
							</>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
}
