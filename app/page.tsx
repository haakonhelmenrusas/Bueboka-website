'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CallToAction, Contributors, Features, Footer, Header, HeroSection, Privacy, Sponsors } from '@/components';
import { useSession } from '@/lib/auth-client';

export default function Home() {
	const router = useRouter();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && session?.user) {
			router.push('/min-side');
		}
	}, [session, isPending, router]);

	// Show the landing page while checking session or if not logged in
	return (
		<>
			<a href="#main-content" className="skip-link">
				Gå til hovedinnhold
			</a>
			<main id="main-content">
				<Header />
				<HeroSection />
				<Features />
				<Privacy />
				<CallToAction />
				<Contributors />
				<Sponsors />
				<Footer />
			</main>
		</>
	);
}
