import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { FeedbackProvider } from '@/lib/FeedbackProvider';

const inter = Inter({ subsets: ['latin'] });

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
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="no-nb">
			<body className={inter.className}>
				<ThemeProvider>
					<FeedbackProvider>{children}</FeedbackProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
