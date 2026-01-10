import { render, screen } from '@testing-library/react';
import { PracticeCreateModal } from '@/components';

describe('PracticeCreateModal', () => {
	test('prefills favorite bow and arrows when opening', async () => {
		render(
			<PracticeCreateModal
				open
				onClose={() => {}}
				onCreate={async () => {}}
				bows={[
					{ id: 'b1', name: 'Min bue', type: 'RECURVE', isFavorite: true },
					{ id: 'b2', name: 'Annen', type: 'BAREBOW', isFavorite: false },
				]}
				arrows={[
					{ id: 'a1', name: 'Pilsett 1', material: 'KARBON', isFavorite: true },
					{ id: 'a2', name: 'Pilsett 2', material: 'ALUMINIUM', isFavorite: false },
				]}
			/>
		);

		// Select triggers are buttons with aria-label set to the Select label.
		expect(screen.getByRole('button', { name: 'Bue' })).toHaveTextContent('Min bue');
		expect(screen.getByRole('button', { name: 'Piler' })).toHaveTextContent('Pilsett 1');
	});
});
