'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
					</div>
				</nav>
			</div>
		</header>
	);
}
