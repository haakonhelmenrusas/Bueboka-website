'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

export function ClarityInit() {
	useEffect(() => {
		if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
			const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
			if (projectId) {
				clarity.init(projectId);
			} else {
				// console.warn('Clarity project ID is not set. Define NEXT_PUBLIC_CLARITY_PROJECT_ID.');
			}
		}
	}, []);

	return null;
}
