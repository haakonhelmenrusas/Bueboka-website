import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Performance optimizations
	compress: true,
	poweredByHeader: false,

	// Optimize images
	images: {
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: 'haakon-rusas',

	project: 'bueboka-web',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Webpack-specific options (not supported with Turbopack)
	webpack: {
		// Automatically tree-shake Sentry logger statements to reduce bundle size
		treeshake: {
			removeDebugLogging: true,
		},

		// Enables automatic instrumentation of Vercel Cron Monitors
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,
	},
});
