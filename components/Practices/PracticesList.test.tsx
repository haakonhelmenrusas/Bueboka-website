import { fireEvent, render, screen } from '@testing-library/react';
import { PracticesList } from './PracticesList';

const practices = [
	{ id: '1', date: '2025-01-08T00:00:00.000Z', arrowsShot: 72 },
	{ id: '2', date: '2025-01-09T00:00:00.000Z', arrowsShot: 60 },
];

describe('PracticesList', () => {
	it('renders list of practices', () => {
		render(<PracticesList practices={practices} />);
		expect(screen.getByText(/8\. jan/)).toBeInTheDocument();
		expect(screen.getByText(/9\. jan/)).toBeInTheDocument();
	});

	it('renders empty state', () => {
		render(<PracticesList practices={[]} />);
		expect(screen.getByText(/Ingen treninger registrert/)).toBeInTheDocument();
	});

	it('calls onSelectPractice when a card is clicked', () => {
		const onSelect = jest.fn();
		render(<PracticesList practices={practices} onSelectPractice={onSelect} />);
		fireEvent.click(screen.getAllByRole('button')[0]);
		expect(onSelect).toHaveBeenCalledWith('1');
	});
});
