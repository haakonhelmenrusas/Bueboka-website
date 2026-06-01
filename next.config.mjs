/** @type {import('next').NextConfig} */
const nextConfig = {
	// Performance optimizations
	compress: true,
	poweredByHeader: false,

	// Enable source maps for production (improves debugging and Lighthouse Best Practices score)
	productionBrowserSourceMaps: true,

	// Bypass Next.js image optimization — Netlify's /_next/image endpoint returns 404
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.apple.com',
				pathname: '/**',
			},
		],
	},

	// Enable React strict mode for better development experience
	reactStrictMode: true,

	// Configure headers for better caching
	async headers() {
		// In development, disable caching for fast refresh
		if (process.env.NODE_ENV === 'development') {
			return [
				{
					source: '/:path*',
					headers: [
						{
							key: 'Cache-Control',
							value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
						},
						{
							key: 'X-DNS-Prefetch-Control',
							value: 'on',
						},
						{
							key: 'X-Frame-Options',
							value: 'SAMEORIGIN',
						},
					],
				},
			];
		}

		// Production caching
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
				],
			},
			{
				// Durable CDN cache for public pages - persists across all Netlify edge nodes
				// stale-while-revalidate means users always get a fast cached response
				source: '/(|logg-inn|ny-bruker|glemt-passord|personvern|sponsing)',
				headers: [
					{
						key: 'Netlify-CDN-Cache-Control',
						value: 'public, max-age=0, stale-while-revalidate=86400, durable',
					},
				],
			},
			{
				// Cache static assets
				source: '/assets/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				// Cache Next.js static files
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},
};

export default nextConfig;
