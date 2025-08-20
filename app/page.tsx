import Image from 'next/image';
import { Header } from '@/components';

export default function Home() {
	return (
		<main className="min-h-screen bg-white text-gray-900">
			<Header />
			<section className="relative pt-24">
				{/* Decorative gradient background */}
				<div
					aria-hidden="true"
					className="from-primary-900/10 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b via-transparent to-transparent"
				/>

				<div className="container mx-auto px-6 lg:px-12">
					<div className="grid items-center gap-12 md:grid-cols-2">
						{/* Left: Hero content */}
						<div className="text-center md:text-left">
							<div className="mx-auto mb-6 inline-flex items-center justify-center rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/20 backdrop-blur-xs md:mx-0">
								<Image className="h-auto w-auto" src="/assets/logo.png" alt="Logo" width={48} height={48} priority />
								<span className="ml-3 text-sm font-medium text-gray-700">Bueskyting for alle</span>
							</div>

							<h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
								<span className="from-primary-900 to-secondary-500 bg-gradient-to-r bg-clip-text text-transparent">Bueboka</span>
							</h1>

							<p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
								Hold oversikt over trening, resultater og utstyr. Laget for bueskyttere – av bueskyttere.
							</p>

							<div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
								<a
									href="https://play.google.com/store/apps/details?id=com.aaronshade.bueboka&hl=no_nb"
									aria-label="Link to Google Play Store"
									className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<Image className="h-auto w-auto" src="/assets/playStore.png" alt="Google Play" width={220} height={64} priority />
								</a>
								<a
									href="https://apps.apple.com/no/app/bueboka/id6448108838?l=nb"
									aria-label="Link to Apple App Store"
									className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<Image className="h-auto w-auto" src="/assets/appStore.png" alt="App Store" width={220} height={64} priority />
								</a>
							</div>
						</div>

						{/* Right: Phone mockups */}
						<div className="relative mx-auto flex w-full max-w-md items-end justify-center gap-6 md:mx-0">
							<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
								<Image src="/assets/iOS.png" alt="iOS app preview" width={320} height={600} className="h-auto w-[320px]" priority />
							</div>
							<div className="relative -mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 md:-mb-12 md:rotate-2">
								<Image src="/assets/Android.png" alt="Android app preview" width={300} height={560} className="h-auto w-[300px]" priority />
							</div>
						</div>
					</div>
				</div>

				{/* Subtle separator */}
				<div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
			</section>

			<footer className="container mx-auto px-6 py-12 lg:px-12">
				<div className="flex items-center justify-center">
					<a
						className="text-sm text-gray-600 transition-colors hover:text-gray-800"
						href="https://rusåsdesign.no"
						target="_blank"
						rel="noopener noreferrer"
					>
						Rusås Design
					</a>
				</div>
			</footer>
		</main>
	);
}
