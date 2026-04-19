'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
	Bueboka2Announcement,
	CallToAction,
	Contributors,
	Footer,
	Header,
	HeroSection,
	Privacy,
	SocialMedia,
	Sponsors,
} from '@/components';

export function LandingPage() {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session) {
			router.replace('/min-side');
		}
	}, [session, router]);
	return (
		<>
			<a href="#main-content" className="skip-link">
				Gå til hovedinnhold
			</a>
			<main id="main-content">
				<Header />
				<HeroSection />
				<Bueboka2Announcement />
				<SocialMedia />
				<Privacy />
				<CallToAction />
				<Contributors />
				<Sponsors />
				<Footer />
			</main>
		</>
	);
}
