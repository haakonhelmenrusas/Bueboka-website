'use client';

import NextError from 'next/error';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	// Log to console so the error is still visible in server logs
	console.error('[GlobalError]', error);

	return (
		<html>
			<body>
				<NextError statusCode={0} />
			</body>
		</html>
	);
}
