'use client';

import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

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
			className="fixed top-0 right-0 left-0 z-50 border-b border-white/20 bg-[#053546]"
		>
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					<motion.a
						href="/"
						onClick={handleLogoClick}
						className="flex cursor-pointer items-center space-x-3"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<div className="rounded-xl bg-white p-2">
							<img src="/assets/logo.png" alt="Bueboka Logo" className="h-6 w-6 object-contain" />
						</div>
						<span className="text-xl font-bold text-white">Bueboka</span>
					</motion.a>

					{/* Desktop Navigation */}
					<nav className="hidden items-center space-x-8 md:flex">
						<a href="#features" className="text-white/80 transition-colors hover:text-white">
							Funksjoner
						</a>
						<a href="#team" className="text-white/80 transition-colors hover:text-white">
							Team
						</a>
						<a href="#sponsors" className="text-white/80 transition-colors hover:text-white">
							Sponsorer
						</a>
						<a href="#contact" className="text-white/80 transition-colors hover:text-white">
							Kontakt
						</a>
					</nav>

					{/* Mobile Menu Button */}
					<button
						onClick={toggleMobileMenu}
						className="text-white transition-colors hover:text-white/80 md:hidden"
						aria-label="Toggle mobile menu"
					>
						{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>

				{/* Mobile Navigation */}
				<motion.nav
					initial={false}
					animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="overflow-hidden md:hidden"
				>
					<div className="space-y-2 pt-4 pb-2">
						<a href="#features" onClick={closeMobileMenu} className="block py-2 text-white/80 transition-colors hover:text-white">
							Funksjoner
						</a>
						<a href="#team" onClick={closeMobileMenu} className="block py-2 text-white/80 transition-colors hover:text-white">
							Team
						</a>
						<a href="#sponsors" onClick={closeMobileMenu} className="block py-2 text-white/80 transition-colors hover:text-white">
							Sponsorer
						</a>
						<a href="#contact" onClick={closeMobileMenu} className="block py-2 text-white/80 transition-colors hover:text-white">
							Kontakt
						</a>
					</div>
				</motion.nav>
			</div>
		</motion.header>
	);
}
