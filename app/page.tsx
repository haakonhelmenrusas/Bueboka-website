'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { LandingPage } from './LandingPage';

export default function Home() {
	const router = useRouter();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && session?.user) {
			router.push('/min-side');
		}
	}, [session, isPending, router]);

	// Show the landing page while checking session or if not logged in
	return <LandingPage />;
}
