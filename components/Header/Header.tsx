'use client';

import React, { useState } from 'react';
import { CircleUserRound, LogOut, Menu, X } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from '@/lib/auth-client';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: session } = useSession();

	const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
	const closeMobileMenu = () => setMobileMenuOpen(false);

	const handleLogoClick = (e: React.MouseEvent) => {
		if (typeof window === 'undefined') return;

		const currentUrl = window.location.href;
		const targetUrl = window.location.origin + window.location.pathname;

		if (currentUrl === targetUrl) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

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
						) : (
							<Link href="/ny-bruker" className={styles.navLink}>
								<CircleUserRound />
							</Link>
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
								<button
									onClick={() => {
										signOut();
										closeMobileMenu();
									}}
									className={styles.mobileLink}
									style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}
								>
									<LogOut size={20} />
									Logg ut
								</button>
							</>
						) : (
							<Link href="/ny-bruker" onClick={closeMobileMenu} className={styles.mobileLink}>
								Logg inn
							</Link>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
}
