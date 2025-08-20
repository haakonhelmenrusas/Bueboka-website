import { Features, Footer, Header, HeroSection } from '@/components';

export default function Home() {
	return (
		<main className="min-h-screen bg-white text-gray-900">
			<Header />
			<HeroSection />
			<Features />
			<Footer />
		</main>
	);
}
