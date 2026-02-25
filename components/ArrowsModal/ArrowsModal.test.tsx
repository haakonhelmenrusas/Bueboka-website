import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowsModal } from './ArrowsModal';

// Mock fetch
global.fetch = jest.fn();

// Mock events
jest.mock('@/lib/events', () => ({
	emitEquipmentChanged: jest.fn(),
}));

describe('ArrowsModal', () => {
	const mockOnClose = jest.fn();
	const mockOnSaved = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(global.fetch as jest.Mock).mockClear();
	});

	describe('Modal Visibility', () => {
		it('should not render when open is false', () => {
			const { container } = render(<ArrowsModal open={false} onClose={mockOnClose} />);
			expect(container.firstChild).toBeNull();
		});

		it('should render when open is true', () => {
			render(<ArrowsModal open={true} onClose={mockOnClose} />);
			expect(screen.getByText('Legg til piler')).toBeInTheDocument();
		});

		it('should show edit title when editing arrows', () => {
			const editingArrows = {
				id: '1',
				name: 'Test Arrows',
				material: 'KARBON' as const,
				arrowsCount: 12,
				diameter: null,
				length: null,
				weight: null,
				spine: null,
				isFavorite: false,
			};
			render(<ArrowsModal open={true} onClose={mockOnClose} editingArrows={editingArrows} />);
			expect(screen.getByText('Rediger piler')).toBeInTheDocument();
		});

		it('should close modal when close button is clicked', () => {
			render(<ArrowsModal open={true} onClose={mockOnClose} />);
			const closeBtn = screen.getByLabelText('Lukk');
			fireEvent.click(closeBtn);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should close modal when overlay is clicked', () => {
			const { container } = render(<ArrowsModal open={true} onClose={mockOnClose} />);
			const overlay = container.querySelector('[class*="overlay"]');
			fireEvent.click(overlay!);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should not close modal when modal content is clicked', () => {
			const { container } = render(<ArrowsModal open={true} onClose={mockOnClose} />);
			const modal = container.querySelector('[class*="modal"]');
			fireEvent.click(modal!);
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('Arrows Form - Create Mode', () => {
		it('should render empty form fields', () => {
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn') as HTMLInputElement;
			expect(nameInput.value).toBe('');
		});

		it('should allow entering arrow name', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn') as HTMLInputElement;
			await user.type(nameInput, 'Carbon Pro X');

			expect(nameInput.value).toBe('Carbon Pro X');
		});

		it('should select material from dropdown', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const materialSelect = screen.getByLabelText('Materiale');
			await user.click(materialSelect);

			const carbonOption = screen.getByText('Karbon');
			await user.click(carbonOption);

			expect(materialSelect).toHaveTextContent('Karbon');
		});

		it('should enter arrows count', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const countInput = screen.getByLabelText('Antall piler');
			await user.clear(countInput);
			await user.type(countInput, '12');

			expect(countInput).toHaveValue(12);
		});

		it('should enter arrow length', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const lengthInput = screen.getByLabelText('Lengde (cm)');
			await user.type(lengthInput, '28.5');

			expect(lengthInput).toHaveValue(28.5);
		});

		it('should enter arrow weight', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const weightInput = screen.getByLabelText('Vekt (g)');
			await user.type(weightInput, '450');

			expect(weightInput).toHaveValue(450);
		});

		it('should enter spine value', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const spineInput = screen.getByLabelText('Spine') as HTMLInputElement;
			await user.type(spineInput, '500');

			expect(spineInput.value).toBe('500');
		});

		it('should toggle favorite checkbox', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const favoriteCheckbox = screen.getByLabelText('Favoritt') as HTMLInputElement;
			expect(favoriteCheckbox.checked).toBe(false);

			await user.click(favoriteCheckbox);
			expect(favoriteCheckbox.checked).toBe(true);
		});

		it('should show validation error when submitting without name', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText('Navn er påkrevd')).toBeInTheDocument();
			});
		});

		it('should successfully create new arrows', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'new-arrows-id' }),
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Carbon Pro X');

			const materialSelect = screen.getByLabelText('Materiale');
			await user.click(materialSelect);
			const carbonOption = screen.getByText('Karbon');
			await user.click(carbonOption);

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/arrows',
					expect.objectContaining({
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: expect.stringContaining('Carbon Pro X'),
					})
				);
			});

			await waitFor(() => {
				expect(screen.getByText('Piler lagt til')).toBeInTheDocument();
			});

			// Wait for auto-close timeout
			await waitFor(
				() => {
					expect(mockOnClose).toHaveBeenCalled();
				},
				{ timeout: 1000 }
			);
		});

		it('should show error message on failed creation', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText('Kunne ikke legge til piler')).toBeInTheDocument();
			});
		});
	});

	describe('Arrows Form - Edit Mode', () => {
		const editingArrows = {
			id: 'arrows-123',
			name: 'Carbon Elite',
			material: 'KARBON' as const,
			arrowsCount: 12,
			diameter: 5.2,
			length: 28.5,
			weight: 425,
			spine: '500',
			isFavorite: true,
		};

		it('should prefill form with existing arrows data', () => {
			render(<ArrowsModal open={true} onClose={mockOnClose} editingArrows={editingArrows} />);

			const nameInput = screen.getByLabelText('Navn') as HTMLInputElement;
			expect(nameInput.value).toBe('Carbon Elite');

			const countInput = screen.getByLabelText('Antall piler');
			expect(countInput).toHaveValue(12);

			const lengthInput = screen.getByLabelText('Lengde (cm)');
			expect(lengthInput).toHaveValue(28.5);

			const weightInput = screen.getByLabelText('Vekt (g)');
			expect(weightInput).toHaveValue(425);

			const spineInput = screen.getByLabelText('Spine') as HTMLInputElement;
			expect(spineInput.value).toBe('500');

			const favoriteCheckbox = screen.getByLabelText('Favoritt') as HTMLInputElement;
			expect(favoriteCheckbox.checked).toBe(true);
		});

		it('should update arrow name', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} editingArrows={editingArrows} />);

			const nameInput = screen.getByLabelText('Navn') as HTMLInputElement;
			await user.clear(nameInput);
			await user.type(nameInput, 'Updated Carbon Elite');

			expect(nameInput.value).toBe('Updated Carbon Elite');
		});

		it('should successfully update arrows', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'arrows-123' }),
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} editingArrows={editingArrows} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.clear(nameInput);
			await user.type(nameInput, 'Updated Arrows');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/arrows/arrows-123',
					expect.objectContaining({
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: expect.stringContaining('Updated Arrows'),
					})
				);
			});

			await waitFor(() => {
				expect(screen.getByText('Piler oppdatert')).toBeInTheDocument();
			});
		});

		it('should show delete button in edit mode', () => {
			render(<ArrowsModal open={true} onClose={mockOnClose} editingArrows={editingArrows} />);
			expect(screen.getByText('Slett pilsett')).toBeInTheDocument();
		});

		it('should successfully delete arrows', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} editingArrows={editingArrows} />);

			const deleteButton = screen.getByText('Slett pilsett');
			await user.click(deleteButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/arrows/arrows-123',
					expect.objectContaining({
						method: 'DELETE',
					})
				);
			});

			await waitFor(
				() => {
					expect(mockOnClose).toHaveBeenCalled();
				},
				{ timeout: 1000 }
			);
		});

		it('should show error message on failed deletion', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'Cannot delete arrows in use' }),
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} editingArrows={editingArrows} />);

			const deleteButton = screen.getByText('Slett pilsett');
			await user.click(deleteButton);

			await waitFor(() => {
				expect(screen.getByText('Cannot delete arrows in use')).toBeInTheDocument();
			});
		});
	});

	describe('Form Validation', () => {
		it('should validate arrows count is positive', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const countInput = screen.getByLabelText('Antall piler');
			await user.clear(countInput);
			await user.type(countInput, '-5');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText(/må være et positivt tall/i)).toBeInTheDocument();
			});
		});

		it('should validate length is positive', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const lengthInput = screen.getByLabelText('Lengde (cm)');
			await user.type(lengthInput, '-10');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText(/må være et positivt tall/i)).toBeInTheDocument();
			});
		});

		it('should validate weight is positive', async () => {
			const user = userEvent.setup();
			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const weightInput = screen.getByLabelText('Vekt (g)');
			await user.type(weightInput, '-100');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText(/må være et positivt tall/i)).toBeInTheDocument();
			});
		});
	});

	describe('Form State Management', () => {
		it('should reset message when modal is reopened', () => {
			const { rerender } = render(<ArrowsModal open={true} onClose={mockOnClose} />);

			// Simulate showing an error
			fireEvent.click(screen.getByText('Lagre'));

			// Close modal
			rerender(<ArrowsModal open={false} onClose={mockOnClose} />);

			// Reopen modal
			rerender(<ArrowsModal open={true} onClose={mockOnClose} />);

			// Error should be cleared
			expect(screen.queryByText(/Kunne ikke/)).not.toBeInTheDocument();
		});

		it('should disable submit button while loading', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)));

			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const saveButton = screen.getByText('Lagre') as HTMLButtonElement;
			await user.click(saveButton);

			expect(saveButton).toBeDisabled();
		});

		it('should handle network errors gracefully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Test Arrows');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText('Network error')).toBeInTheDocument();
			});
		});
	});

	describe('Optional Fields', () => {
		it('should allow creating arrows with only required fields', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'new-id' }),
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Minimal Arrows');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalled();
			});

			const callArgs = (global.fetch as jest.Mock).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.name).toBe('Minimal Arrows');
			expect(body.material).toBeDefined();
		});

		it('should include all optional fields when provided', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'new-id' }),
			});

			render(<ArrowsModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn');
			await user.type(nameInput, 'Complete Arrows');

			const countInput = screen.getByLabelText('Antall piler');
			await user.clear(countInput);
			await user.type(countInput, '12');

			const lengthInput = screen.getByLabelText('Lengde (cm)');
			await user.type(lengthInput, '28.5');

			const weightInput = screen.getByLabelText('Vekt (g)');
			await user.type(weightInput, '450');

			const spineInput = screen.getByLabelText('Spine');
			await user.type(spineInput, '500');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalled();
			});

			const callArgs = (global.fetch as jest.Mock).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.arrowsCount).toBe(12);
			expect(body.length).toBe(28.5);
			expect(body.weight).toBe(450);
			expect(body.spine).toBe('500');
		});
	});
});
