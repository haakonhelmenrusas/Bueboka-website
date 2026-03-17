// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
	Sentry.init({
		dsn: 'https://f46e20abb1add226919a893037591782@o4505578901929984.ingest.us.sentry.io/4509982258954240',

		// Sample 10% of traces — tracesSampleRate: 1 instruments every request and adds measurable overhead
		tracesSampleRate: 0.1,

		// Console log forwarding adds overhead on every log call — keep off unless actively debugging
		enableLogs: false,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,
	});
}
