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
