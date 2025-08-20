'use client';

import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
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

	return (
		<motion.header
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6 }}
			className={styles.header}
		>
			<div className={styles.container}>
				<div className={styles.row}>
					<motion.a href="/" onClick={handleLogoClick} className={styles.logoLink} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<div className={styles.logoBox}>
							<img src="/assets/logo.png" alt="Bueboka Logo" className={styles.logoImg} />
						</div>
						<span className={styles.brand}>Bueboka</span>
					</motion.a>

					{/* Desktop Navigation */}
					<nav className={styles.desktopNav} aria-label="Primary">
						<a href="#features" className={styles.navLink}>
							Funksjoner
						</a>
						<a href="#team" className={styles.navLink}>
							Team
						</a>
						<a href="#sponsors" className={styles.navLink}>
							Sponsorer
						</a>
						<a href="#contact" className={styles.navLink}>
							Kontakt
						</a>
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
				<motion.nav
					id="mobile-menu"
					initial={false}
					animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
					transition={{ duration: 0.3 }}
					className={styles.mobileNav}
				>
					<div className={styles.mobileLinks}>
						<a href="#features" onClick={closeMobileMenu} className={styles.mobileLink}>
							Funksjoner
						</a>
						<a href="#team" onClick={closeMobileMenu} className={styles.mobileLink}>
							Team
						</a>
						<a href="#sponsors" onClick={closeMobileMenu} className={styles.mobileLink}>
							Sponsorer
						</a>
						<a href="#contact" onClick={closeMobileMenu} className={styles.mobileLink}>
							Kontakt
						</a>
					</div>
				</motion.nav>
			</div>
		</motion.header>
	);
}
