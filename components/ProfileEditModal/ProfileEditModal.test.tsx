import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditModal } from '@/components';

// Mock fetch
global.fetch = jest.fn();

describe('ProfileEditModal', () => {
	const mockUser = {
		id: '123',
		name: 'Test User',
		email: 'test@example.com',
		club: 'Oslo Bueskyttere',
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
			const closeBtn = screen.getByLabelText('Lukk');
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
			const modal = container.querySelector('[role="dialog"]');
			fireEvent.click(modal!);
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('Profile Form', () => {
		it('should render profile form with club select', () => {
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);
			const clubBtn = screen.getByRole('button', { name: /Klubb/i });
			expect(clubBtn).toBeInTheDocument();
			expect(screen.getByText('Oslo Bueskyttere')).toBeInTheDocument();
		});

		it('should update club value when an option is selected', async () => {
			const user = userEvent.setup();
			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			await user.click(screen.getByRole('button', { name: /Klubb/i }));
			await user.click(screen.getByRole('option', { name: 'Bergen Bueskyttere' }));

			expect(screen.getByText('Bergen Bueskyttere')).toBeInTheDocument();
		});

		it('should submit profile form successfully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} onProfileUpdate={mockOnProfileUpdate} />);

			await user.click(screen.getByRole('button', { name: /Klubb/i }));
			await user.click(screen.getByRole('option', { name: 'Stavanger Bueskyttere' }));

			const submitBtn = screen.getByRole('button', { name: 'Lagre' });
			await user.click(submitBtn);

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.any(Object));
			});
		});

		it('should disable submit button while loading', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)));

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const submitBtn = screen.getByRole('button', { name: 'Lagre' });
			await user.click(submitBtn);

			expect(submitBtn).toBeDisabled();
		});

		it('should handle API errors gracefully', async () => {
			const user = userEvent.setup();
			(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

			render(<ProfileEditModal isOpen={true} onClose={mockOnClose} user={mockUser} />);

			const submitBtn = screen.getByText('Lagre');
			await user.click(submitBtn);

			await waitFor(
				() => {
					expect(submitBtn).not.toBeDisabled();
				},
				{ timeout: 2000 }
			);
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
