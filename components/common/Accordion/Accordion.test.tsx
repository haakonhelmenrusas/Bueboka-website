import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';

describe('Accordion', () => {
	it('renders items and toggles open/close', async () => {
		const user = userEvent.setup();

		render(
			<Accordion
				items={[
					{ id: 'one', title: 'Første', content: <p>Innhold 1</p> },
					{ id: 'two', title: 'Andre', content: <p>Innhold 2</p> },
				]}
			/>
		);

		// Initially closed
		expect(screen.queryByText('Innhold 1')).not.toBeInTheDocument();

		// Open first
		await user.click(screen.getByRole('button', { name: /første/i }));
		expect(screen.getByText('Innhold 1')).toBeInTheDocument();

		// Close first
		await user.click(screen.getByRole('button', { name: /første/i }));
		expect(screen.queryByText('Innhold 1')).not.toBeInTheDocument();
	});

	it('supports icons in title row', () => {
		render(<Accordion items={[{ id: 'one', title: 'Med ikon', content: <p>Ikon</p>, icon: <span aria-hidden>★</span> }]} />);
		expect(screen.getByRole('button', { name: /med ikon/i })).toBeInTheDocument();
	});
});
