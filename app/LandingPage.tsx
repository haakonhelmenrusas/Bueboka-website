'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionProvider';
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
import { useTranslation } from '@/context/LanguageProvider';

export function LandingPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const { t } = useTranslation();

	useEffect(() => {
		if (session) {
			router.replace('/min-side');
		}
	}, [session, router]);
	return (
		<>
			<a href="#main-content" className="skip-link">
				{t['nav.skipToContent']}
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
