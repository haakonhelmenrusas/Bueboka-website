import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPage } from './LandingPage';

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect('/min-side');
	}

	return <LandingPage />;
}
