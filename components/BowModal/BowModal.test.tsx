import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BowModal } from './BowModal';

// Mock fetch
global.fetch = jest.fn();

// Mock events
jest.mock('@/lib/events', () => ({
	emitEquipmentChanged: jest.fn(),
}));

describe('BowModal', () => {
	const mockOnClose = jest.fn();
	const mockOnSaved = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(global.fetch as jest.Mock).mockClear();
	});

	describe('Modal Visibility', () => {
		it('should not render when open is false', () => {
			const { container } = render(<BowModal open={false} onClose={mockOnClose} />);
			expect(container.firstChild).toBeNull();
		});

		it('should render when open is true', () => {
			render(<BowModal open={true} onClose={mockOnClose} />);
			expect(screen.getByText('Legg til bue')).toBeInTheDocument();
		});

		it('should show edit title when editing bow', () => {
			const editingBow = {
				id: '1',
				name: 'Test Bow',
				type: 'RECURVE' as const,
				eyeToNock: null,
				aimMeasure: null,
				eyeToSight: null,
				isFavorite: false,
				notes: null,
			};
			render(<BowModal open={true} onClose={mockOnClose} editingBow={editingBow} />);
			expect(screen.getByText('Rediger bue')).toBeInTheDocument();
		});

		it('should close modal when close button is clicked', () => {
			render(<BowModal open={true} onClose={mockOnClose} />);
			const closeBtn = screen.getByLabelText('Lukk');
			fireEvent.click(closeBtn);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should close modal when overlay is clicked', () => {
			const { container } = render(<BowModal open={true} onClose={mockOnClose} />);
			const overlay = container.querySelector('[class*="overlay"]');
			fireEvent.click(overlay!);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should not close modal when modal content is clicked', () => {
			const { container } = render(<BowModal open={true} onClose={mockOnClose} />);
			const modal = container.querySelector('[class*="modal"]');
			fireEvent.click(modal!);
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('Bow Form - Create Mode', () => {
		it('should render empty form fields', () => {
			render(<BowModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn på bue') as HTMLInputElement;
			expect(nameInput.value).toBe('');
		});

		it('should allow entering bow name', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn på bue') as HTMLInputElement;
			await user.type(nameInput, 'My New Bow');

			expect(nameInput.value).toBe('My New Bow');
		});

		it('should select bow type from dropdown', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} />);

			const typeSelect = screen.getByLabelText('Type');
			await user.click(typeSelect);

			const compoundOption = screen.getByText('Compound');
			await user.click(compoundOption);

			expect(typeSelect).toHaveTextContent('Compound');
		});

		it('should toggle favorite checkbox', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} />);

			const favoriteCheckbox = screen.getByLabelText('Favorittbue') as HTMLInputElement;
			expect(favoriteCheckbox.checked).toBe(false);

			await user.click(favoriteCheckbox);
			expect(favoriteCheckbox.checked).toBe(true);
		});

		it('should enter notes in textarea', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} />);

			const notesTextarea = screen.getByLabelText('Notater') as HTMLTextAreaElement;
			await user.type(notesTextarea, 'Great bow for competitions');

			expect(notesTextarea.value).toBe('Great bow for competitions');
		});

		it('should show validation error when submitting without name', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} />);

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText('Påkrevd')).toBeInTheDocument();
			});
		});

		it('should successfully create a new bow', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'new-bow-id' }),
			});

			render(<BowModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} />);

			const nameInput = screen.getByLabelText('Navn på bue');
			await user.type(nameInput, 'My New Bow');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/bows',
					expect.objectContaining({
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: expect.stringContaining('My New Bow'),
					})
				);
			});

			await waitFor(() => {
				expect(screen.getByText('Bue lagt til')).toBeInTheDocument();
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

			render(<BowModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn på bue');
			await user.type(nameInput, 'My New Bow');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(screen.getByText('Kunne ikke lage bue')).toBeInTheDocument();
			});
		});
	});

	describe('Bow Form - Edit Mode', () => {
		const editingBow = {
			id: 'bow-123',
			name: 'Test Recurve',
			type: 'RECURVE' as const,
			eyeToNock: 75.5,
			aimMeasure: 30.2,
			eyeToSight: 45.8,
			isFavorite: true,
			notes: 'Competition bow',
		};

		it('should prefill form with existing bow data', () => {
			render(<BowModal open={true} onClose={mockOnClose} editingBow={editingBow} />);

			const nameInput = screen.getByLabelText('Navn på bue') as HTMLInputElement;
			expect(nameInput.value).toBe('Test Recurve');

			const favoriteCheckbox = screen.getByLabelText('Favorittbue') as HTMLInputElement;
			expect(favoriteCheckbox.checked).toBe(true);

			const notesTextarea = screen.getByLabelText('Notater') as HTMLTextAreaElement;
			expect(notesTextarea.value).toBe('Competition bow');
		});

		it('should update bow name', async () => {
			const user = userEvent.setup();
			render(<BowModal open={true} onClose={mockOnClose} editingBow={editingBow} />);

			const nameInput = screen.getByLabelText('Navn på bue') as HTMLInputElement;
			await user.clear(nameInput);
			await user.type(nameInput, 'Updated Recurve');

			expect(nameInput.value).toBe('Updated Recurve');
		});

		it('should successfully update bow', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 'bow-123' }),
			});

			render(<BowModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} editingBow={editingBow} />);

			const nameInput = screen.getByLabelText('Navn på bue');
			await user.clear(nameInput);
			await user.type(nameInput, 'Updated Bow Name');

			const saveButton = screen.getByText('Lagre');
			await user.click(saveButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/bows/bow-123',
					expect.objectContaining({
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: expect.stringContaining('Updated Bow Name'),
					})
				);
			});

			await waitFor(() => {
				expect(screen.getByText('Bue oppdatert')).toBeInTheDocument();
			});
		});

		it('should show delete button in edit mode', () => {
			render(<BowModal open={true} onClose={mockOnClose} editingBow={editingBow} />);
			expect(screen.getByText('Slett bue')).toBeInTheDocument();
		});

		it('should successfully delete bow', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
			});

			render(<BowModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} editingBow={editingBow} />);

			const deleteButton = screen.getByText('Slett bue');
			await user.click(deleteButton);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					'/api/bows/bow-123',
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
				json: async () => ({ error: 'Cannot delete bow in use' }),
			});

			render(<BowModal open={true} onClose={mockOnClose} editingBow={editingBow} />);

			const deleteButton = screen.getByText('Slett bue');
			await user.click(deleteButton);

			await waitFor(() => {
				expect(screen.getByText('Cannot delete bow in use')).toBeInTheDocument();
			});
		});
	});

	describe('Form State Management', () => {
		it('should reset message when modal is reopened', () => {
			const { rerender } = render(<BowModal open={true} onClose={mockOnClose} />);

			// Simulate showing an error
			fireEvent.click(screen.getByText('Lagre'));

			// Close modal
			rerender(<BowModal open={false} onClose={mockOnClose} />);

			// Reopen modal
			rerender(<BowModal open={true} onClose={mockOnClose} />);

			// Error should be cleared
			expect(screen.queryByText(/Kunne ikke/)).not.toBeInTheDocument();
		});

		it('should disable submit button while loading', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)));

			render(<BowModal open={true} onClose={mockOnClose} />);

			const nameInput = screen.getByLabelText('Navn på bue');
			await user.type(nameInput, 'Test Bow');

			const saveButton = screen.getByText('Lagre') as HTMLButtonElement;
			await user.click(saveButton);

			expect(saveButton).toBeDisabled();
		});
	});
});
