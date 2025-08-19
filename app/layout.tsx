import type { Metadata } from 'next';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

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
			<Head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
			</Head>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
