import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PracticeCard } from '@/components';

describe('PracticeCard', () => {
	it('renders date and arrows shot', () => {
		render(<PracticeCard id="1" date="2025-01-08T00:00:00.000Z" arrowsShot={72} />);

		expect(screen.getByText(/8. jan/)).toBeInTheDocument();
		expect(screen.getByText(/72 piler/)).toBeInTheDocument();
	});

	it('calls onClick with id when clicked', () => {
		const onClick = jest.fn();
		render(<PracticeCard id="1" date="2025-01-08T00:00:00.000Z" arrowsShot={72} onClick={onClick} />);

		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledWith('1');
	});
});
