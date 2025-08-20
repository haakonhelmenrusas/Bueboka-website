import { Contributors, Features, Footer, Header, HeroSection, Sponsors } from '@/components';

export default function Home() {
	return (
		<main className="min-h-screen bg-white text-gray-900">
			<Header />
			<HeroSection />
			<Features />
			<Contributors />
			<Sponsors />
			<Footer />
		</main>
	);
}
