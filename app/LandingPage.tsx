import { Bueboka2Announcement, CallToAction, Contributors, Features, Footer, Header, HeroSection, Privacy, Sponsors } from '@/components';

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
