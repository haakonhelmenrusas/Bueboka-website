import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { FeedbackProvider } from '@/lib/FeedbackProvider';
import { ClarityInit } from '@/lib/ClarityInit';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
	themeColor: '#053546',
	width: 'device-width',
	initialScale: 1,
};

export const metadata: Metadata = {
	title: 'Bueboka',
	description: 'En ny app for bueskyttere i Norge',
	applicationName: 'Bueboka',
	authors: [
		{
			name: 'Haakon Helmen Rusås',
			url: 'https://github.com/haakonhelmenrusas',
		},
	],
	keywords: ['bueskyting', 'bueboka', 'idrett', 'trening', 'konkurranse', 'app', 'norge', 'ios', 'android'],
	publisher: 'Rusås Design',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Bueboka',
	},
	icons: {
		apple: '/assets/logo.png',
	},
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="no-nb">
			<body className={inter.className}>
				<ClarityInit />
				<ThemeProvider>
					<FeedbackProvider>{children}</FeedbackProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
