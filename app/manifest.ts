import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Bueboka',
		short_name: 'Bueboka',
		description: 'Hold oversikt over trening, resultater og utstyr. Laget for bueskyttere – av bueskyttere.',
		start_url: '/',
		display: 'standalone',
		background_color: '#053546',
		theme_color: '#053546',
		orientation: 'portrait',
		icons: [
			{
				src: '/assets/logo.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/assets/logo.png',
				sizes: '512x512',
				type: 'image/png',
			},
			{
				src: '/assets/logo.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	};
}
