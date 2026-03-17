// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
