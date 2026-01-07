import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditModal } from './ProfileEditModal';

// Mock fetch
global.fetch = jest.fn();

describe('ProfileEditModal', () => {
	const mockUser = {
		id: '123',
		name: 'Test User',
		email: 'test@example.com',
		club: 'Test Club',
	};

	const mockOnClose = jest.fn();
	const mockOnProfileUpdate = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(global.fetch as jest.Mock).mockClear();
	});

	describe('Modal Visibility', () => {
		it('should not render when isOpen is false', () => {
			const { container } = render(<ProfileEditModal isOpen={false} onClose={mockOnClose} user={mockUser} />);
			expect(container.firstChild).toBeNull();
		});

		it('should render when isOpen is true', () => {
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			expect(screen.getByText('Rediger profil')).toBeInTheDocument();
		});

		it('should close modal when close button is clicked', () => {
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			const closeBtn = screen.getByLabelText('Close modal');
			fireEvent.click(closeBtn);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should close modal when overlay is clicked', () => {
			const { container } = render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			const overlay = container.querySelector('[class*="overlay"]');
			fireEvent.click(overlay!);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should not close modal when modal content is clicked', () => {
			const { container } = render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			const modal = container.querySelector('[class*="modal"]');
			fireEvent.click(modal!);
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('Tab Navigation', () => {
		it('should render all tabs', () => {
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			expect(screen.getByText('Profil')).toBeInTheDocument();
			expect(screen.getByText('Legg til bue')).toBeInTheDocument();
			expect(screen.getByText('Legg til piler')).toBeInTheDocument();
		});

		it('should switch to bow tab when clicked', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const bowTab = screen.getByText('Legg til bue');
			await user.click(bowTab);

			expect(screen.getByLabelText('Navn på bue')).toBeInTheDocument();
			expect(screen.getByLabelText('Type')).toBeInTheDocument();
		});

		it('should switch to arrows tab when clicked', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const arrowsTab = screen.getByText('Legg til piler');
			await user.click(arrowsTab);

			expect(screen.getByLabelText('Navn på piler')).toBeInTheDocument();
			expect(screen.getByLabelText('Material')).toBeInTheDocument();
		});
	});

	describe('Profile Form', () => {
		it('should render profile form with club input', () => {
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			const clubInput = screen.getByPlaceholderText('Din klubb') as HTMLInputElement;
			expect(clubInput).toBeInTheDocument();
			expect(clubInput.value).toBe('Test Club');
		});

		it('should update club input value', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const clubInput = screen.getByPlaceholderText('Din klubb') as HTMLInputElement;
			await user.clear(clubInput);
			await user.type(clubInput, 'New Club');

			expect(clubInput.value).toBe('New Club');
		});

		it('should submit profile form successfully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} onProfileUpdate={mockOnProfileUpdate} />);

			const clubInput = screen.getByPlaceholderText('Din klubb');
			await user.clear(clubInput);
			await user.type(clubInput, 'Updated Club');

			const submitBtn = screen.getByText('Lagre');
			await user.click(submitBtn);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.any(Object));
			});
		});

		it('should disable submit button while loading', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)));

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const submitBtn = screen.getByText('Lagre') as HTMLButtonElement;
			await user.click(submitBtn);

			expect(submitBtn.disabled).toBe(true);
		});

		it('should handle API errors gracefully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const submitBtn = screen.getByText('Lagre');
			await user.click(submitBtn);

			// Verify form is no longer disabled after error
			await waitFor(
				() => {
					expect(submitBtn).not.toBeDisabled();
				},
				{ timeout: 2000 }
			);
		});
	});

	describe('Bow Form', () => {
		it('should render bow form with name and type inputs', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const bowTabBtn = screen.getAllByText('Legg til bue')[0];
			await user.click(bowTabBtn);

			expect(screen.getByLabelText('Navn på bue')).toBeInTheDocument();
			expect(screen.getByLabelText('Type')).toBeInTheDocument();
		});

		it('should update bow name input', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const bowTabBtn = screen.getAllByText('Legg til bue')[0];
			await user.click(bowTabBtn);

			const bowNameInput = screen.getByPlaceholderText('f.eks. Min recurve bue') as HTMLInputElement;
			await user.type(bowNameInput, 'My Bow');

			expect(bowNameInput.value).toBe('My Bow');
		});

		it('should have correct bow type options', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const bowTabBtn = screen.getAllByText('Legg til bue')[0];
			await user.click(bowTabBtn);

			const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement;
			const options = Array.from(typeSelect.options).map((opt) => opt.value);

			expect(options).toContain('RECURVE');
			expect(options).toContain('COMPOUND');
			expect(options).toContain('LONGBOW');
			expect(options).toContain('BAREBOW');
		});

		it('should submit bow form successfully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} onProfileUpdate={mockOnProfileUpdate} />);

			const bowTabBtn = screen.getAllByText('Legg til bue')[0];
			await user.click(bowTabBtn);

			const bowNameInput = screen.getByPlaceholderText('f.eks. Min recurve bue');
			await user.type(bowNameInput, 'Test Bow');

			const submitBtn = screen.getAllByText('Legg til bue')[1];
			await user.click(submitBtn);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith('/api/bows', expect.any(Object));
			});
		});

		it('should show success message after bow is added', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const bowTabBtn = screen.getAllByText('Legg til bue')[0];
			await user.click(bowTabBtn);

			const bowNameInput = screen.getByPlaceholderText('f.eks. Min recurve bue');
			await user.type(bowNameInput, 'Test Bow');

			const submitBtn = screen.getAllByText('Legg til bue')[1];
			await user.click(submitBtn);

			await waitFor(() => {
				expect(screen.getByText('Bue lagt til')).toBeInTheDocument();
			});
		});
	});

	describe('Arrows Form', () => {
		it('should render arrows form with name and material inputs', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const arrowsTabBtn = screen.getAllByText('Legg til piler')[0];
			await user.click(arrowsTabBtn);

			expect(screen.getByLabelText('Navn på piler')).toBeInTheDocument();
			expect(screen.getByLabelText('Material')).toBeInTheDocument();
		});

		it('should update arrow name input', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const arrowsTabBtn = screen.getAllByText('Legg til piler')[0];
			await user.click(arrowsTabBtn);

			const arrowNameInput = screen.getByPlaceholderText('f.eks. Mine karbonpiler') as HTMLInputElement;
			await user.type(arrowNameInput, 'My Arrows');

			expect(arrowNameInput.value).toBe('My Arrows');
		});

		it('should have correct arrow material options', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const arrowsTabBtn = screen.getAllByText('Legg til piler')[0];
			await user.click(arrowsTabBtn);

			const materialSelect = screen.getByLabelText('Material') as HTMLSelectElement;
			const options = Array.from(materialSelect.options).map((opt) => opt.value);

			expect(options).toContain('KARBON');
			expect(options).toContain('ALUMINIUM');
			expect(options).toContain('TREVERK');
		});

		it('should submit arrows form successfully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} onProfileUpdate={mockOnProfileUpdate} />);

			const arrowsTabBtn = screen.getAllByText('Legg til piler')[0];
			await user.click(arrowsTabBtn);

			const arrowNameInput = screen.getByPlaceholderText('f.eks. Mine karbonpiler');
			await user.type(arrowNameInput, 'Test Arrows');

			const submitBtn = screen.getAllByText('Legg til piler')[1];
			await user.click(submitBtn);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith('/api/arrows', expect.any(Object));
			});
		});

		it('should show success message after arrows are added', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const arrowsTabBtn = screen.getAllByText('Legg til piler')[0];
			await user.click(arrowsTabBtn);

			const arrowNameInput = screen.getByPlaceholderText('f.eks. Mine karbonpiler');
			await user.type(arrowNameInput, 'Test Arrows');

			const submitBtn = screen.getAllByText('Legg til piler')[1];
			await user.click(submitBtn);

			await waitFor(() => {
				expect(screen.getByText('Piler lagt til')).toBeInTheDocument();
			});
		});
	});

	describe('Error Handling', () => {
		it('should show error on network failure', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const submitBtn = screen.getByText('Lagre');
			await user.click(submitBtn);

			await waitFor(
				() => {
					expect(screen.getByText('Network error')).toBeInTheDocument();
				},
				{ timeout: 2000 }
			);
		});

		it('should clear message after successful submission', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} onProfileUpdate={mockOnProfileUpdate} />);

			const submitBtn = screen.getByText('Lagre');
			await user.click(submitBtn);

			await waitFor(
				() => {
					expect(screen.getByText('Profil oppdatert')).toBeInTheDocument();
				},
				{ timeout: 2000 }
			);
		});
	});
});
