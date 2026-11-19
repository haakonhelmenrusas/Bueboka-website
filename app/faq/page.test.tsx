import React from 'react';
import { fireEvent, render, screen } from '@/lib/test-utils';
import FaqPage from './page';

jest.mock('next/navigation', () => ({
	usePathname: () => '/faq',
	useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/context/FeedbackProvider', () => ({
	useFeedback: () => ({ openFeedback: jest.fn() }),
}));

describe('FAQ page', () => {
	it('renders the heading and all five questions with icons', () => {
		render(<FaqPage />);

		expect(screen.getByRole('heading', { level: 1, name: 'Ofte stilte spørsmål' })).toBeTruthy();
		expect(screen.getByText('Hva er Bueboka?')).toBeTruthy();
		expect(screen.getByText('Hvordan legger jeg til en bue?')).toBeTruthy();
		expect(screen.getByText('Hvordan legger jeg til et pilsett?')).toBeTruthy();
		expect(screen.getByText(/bare teller piler/)).toBeTruthy();
		expect(screen.getByText(/registrerer jeg en økt med scoring/)).toBeTruthy();
	});

	it('links to /faq in the header', () => {
		render(<FaqPage />);
		const faqLinks = screen.getAllByRole('link', { name: 'FAQ' });
		expect(faqLinks.length).toBeGreaterThan(0);
		expect(faqLinks[0].getAttribute('href')).toBe('/faq');
	});

	it('opens an accordion answer on click and shows the guide text', () => {
		render(<FaqPage />);

		// first item is open by default
		expect(screen.getByText(/gratis tjeneste for bueskyting/)).toBeTruthy();

		fireEvent.click(screen.getByText('Hvordan legger jeg til en bue?'));
		expect(screen.getByText(/Legg til bue/)).toBeTruthy();
	});

	it('covers both practice variants: without scoring and with scoring', () => {
		render(<FaqPage />);

		fireEvent.click(screen.getByText(/bare teller piler/));
		expect(screen.getByText(/Piler u\/score/)).toBeTruthy();

		fireEvent.click(screen.getByText(/registrerer jeg en økt med scoring/));
		expect(screen.getByText(/Piler m\/score/)).toBeTruthy();
	});

	it('includes the sight mark guide with steps and a screenshot', () => {
		render(<FaqPage />);

		fireEvent.click(screen.getByText(/siktemerke i appen/));
		expect(screen.getByText(/Ny innskyting/)).toBeTruthy();
		expect(screen.getByText(/Beregn siktemerker/)).toBeTruthy();

		const img = screen.getByAltText(/siktemerker-fanen/);
		expect(img.getAttribute('src')).toBe('/assets/faq/faq-siktemerker.jpg');
	});

	it('shows an app screenshot inside the equipment and practice answers', () => {
		render(<FaqPage />);

		fireEvent.click(screen.getByText('Hvordan legger jeg til en bue?'));
		expect(screen.getByAltText(/hjemmeskjermen/).getAttribute('src')).toBe('/assets/faq/faq-home.jpg');

		fireEvent.click(screen.getByText(/bare teller piler/));
		expect(screen.getByAltText(/Skyt og klikk/).getAttribute('src')).toBe('/assets/faq/faq-skyt-og-klikk.jpg');

		fireEvent.click(screen.getByText(/registrerer jeg en økt med scoring/));
		expect(screen.getByAltText(/aktivitetsoversikt/).getAttribute('src')).toBe('/assets/faq/faq-aktivitet.jpg');
	});
});
