import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PracticeDetailsModal } from './PracticeDetailsModal';
import { Environment, WeatherCondition } from '@prisma/client';

const practice = {
	id: '1',
	date: '2025-01-08T00:00:00.000Z',
	location: 'Oslo',
	environment: Environment.INDOOR,
	weather: [WeatherCondition.SUN, WeatherCondition.CLOUDED],
	notes: 'God trening',
	roundType: { name: '30m', distanceMeters: 30, targetSizeCm: 80 },
	bow: { name: 'Recurve', type: 'RECURVE' },
	arrows: { name: 'X10', material: 'KARBON' },
	ends: [],
};

describe('PracticeDetailsModal', () => {
	it('renders nothing when closed', () => {
		render(<PracticeDetailsModal open={false} practice={practice} onClose={() => {}} />);
		expect(screen.queryByText(/Trening/)).not.toBeInTheDocument();
	});

	it('renders data when open', () => {
		render(<PracticeDetailsModal open={true} practice={practice} onClose={() => {}} />);
		expect(screen.getByText(/Trening/)).toBeInTheDocument();
		expect(screen.getByText('Oslo')).toBeInTheDocument();
		expect(screen.getByText(/Inne/)).toBeInTheDocument();
		expect(screen.getByText(/Sol/)).toBeInTheDocument();
		expect(screen.getByText(/Overskyet/)).toBeInTheDocument();
	});

	it('calls onClose when clicking overlay', () => {
		const onClose = jest.fn();
		render(<PracticeDetailsModal open={true} practice={practice} onClose={onClose} />);
		fireEvent.click(screen.getByRole('presentation'));
		expect(onClose).toHaveBeenCalled();
	});
});
