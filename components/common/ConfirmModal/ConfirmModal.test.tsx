import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '@/components';

describe('ConfirmModal', () => {
	const defaultProps = {
		open: true,
		onClose: jest.fn(),
		onConfirm: jest.fn(),
		title: 'Confirm Action',
		message: 'Are you sure you want to proceed?',
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders when open is true', () => {
		render(<ConfirmModal {...defaultProps} />);
		expect(screen.getByText('Confirm Action')).toBeInTheDocument();
		expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
	});

	it('does not render when open is false', () => {
		render(<ConfirmModal {...defaultProps} open={false} />);
		expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
	});

	it('calls onClose when cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(<ConfirmModal {...defaultProps} onClose={onClose} />);

		await user.click(screen.getByRole('button', { name: /avbryt/i }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onConfirm when confirm button is clicked', async () => {
		const user = userEvent.setup();
		const onConfirm = jest.fn();
		render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

		await user.click(screen.getByRole('button', { name: /bekreft/i }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('uses custom button labels when provided', () => {
		render(<ConfirmModal {...defaultProps} confirmLabel="Yes, delete" cancelLabel="No, cancel" />);

		expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'No, cancel' })).toBeInTheDocument();
	});

	it('applies danger variant styling', () => {
		render(<ConfirmModal {...defaultProps} variant="danger" />);
		const confirmButton = screen.getByRole('button', { name: /bekreft/i });
		expect(confirmButton).toHaveClass('danger');
	});

	it('disables buttons when isLoading is true', () => {
		render(<ConfirmModal {...defaultProps} isLoading={true} confirmLabel="Delete" />);

		const confirmButton = screen.getByRole('button', { name: /vennligst vent/i });
		const cancelButton = screen.getByRole('button', { name: /avbryt/i });
		const closeButton = screen.getByRole('button', { name: /lukk/i });

		expect(confirmButton).toBeDisabled();
		expect(cancelButton).toBeDisabled();
		expect(closeButton).toBeDisabled();
	});

	it('shows loading text when isLoading is true', () => {
		render(<ConfirmModal {...defaultProps} isLoading={true} />);
		expect(screen.getByText('Vennligst vent...')).toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(<ConfirmModal {...defaultProps} onClose={onClose} />);

		await user.click(screen.getByRole('button', { name: /lukk/i }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
