import React from 'react';
import { render, screen, waitFor, within } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { PracticeFormModal } from '@/components';
import { Environment } from '@/lib/prismaEnums';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const defaultProps = {
	open: true,
	onClose: jest.fn(),
	onSave: jest.fn().mockResolvedValue(undefined),
	mode: 'create' as const,
	bows: [],
	arrows: [],
};

const sampleBows = [
	{ id: 'bow-1', name: 'Hoyt Xceed', type: 'RECURVE', isFavorite: false },
	{ id: 'bow-2', name: 'Win&Win Inno Max', type: 'RECURVE', isFavorite: true },
];

const sampleArrows = [
	{ id: 'arr-1', name: 'Easton X10', material: 'KARBON', isFavorite: true },
	{ id: 'arr-2', name: 'Easton X7', material: 'ALUMINIUM', isFavorite: false },
];

// ─── Helper: advance N wizard steps ──────────────────────────────────────────

const goToStep = async (user: ReturnType<typeof userEvent.setup>, steps: number) => {
	for (let i = 0; i < steps; i++) {
		await user.click(screen.getByRole('button', { name: /neste steg/i }));
	}
};

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
	jest.clearAllMocks();
	window.localStorage.clear();
});

describe('PracticeFormModal', () => {
	// ─── Rendering ──────────────────────────────────────────────────────────────

	describe('rendering', () => {
		it('renders nothing when open=false', () => {
			render(<PracticeFormModal {...defaultProps} open={false} />);
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('renders the wizard dialog in create mode', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.getByRole('dialog', { name: /ny trening/i })).toBeInTheDocument();
			expect(screen.getByText('Ny trening')).toBeInTheDocument();
		});

		it('renders "Rediger trening" title in edit mode', () => {
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{ id: 'p1', date: '2025-01-08T00:00:00.000Z', arrowsShot: 72, environment: Environment.INDOOR, weather: [] }}
				/>
			);
			expect(screen.getByText('Rediger trening')).toBeInTheDocument();
		});

		it('renders all three step indicator labels', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.getAllByText('Info').length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText('Runder')).toBeInTheDocument();
			expect(screen.getByText('Refleksjon')).toBeInTheDocument();
		});
	});

	// ─── Step navigation ────────────────────────────────────────────────────────

	describe('step navigation', () => {
		it('shows the Info step (Dato field) by default', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.getByLabelText('Dato')).toBeInTheDocument();
		});

		it('Forrige steg button is disabled on the first step', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.getByRole('button', { name: /forrige steg/i })).toBeDisabled();
		});

		it('navigates forward to Runder step', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			expect(screen.getByText('Runde 1')).toBeInTheDocument();
		});

		it('navigates backward from Runder to Info step', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /forrige steg/i }));
			expect(screen.getByLabelText('Dato')).toBeInTheDocument();
		});

		it('shows Lagre trening button on the last (Refleksjon) step', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			expect(screen.getByRole('button', { name: /lagre trening/i })).toBeInTheDocument();
		});

		it('can jump directly to Runder via step indicator', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /gå til runder/i }));
			expect(screen.getByText('Runde 1')).toBeInTheDocument();
		});

		it('can jump directly to Refleksjon via step indicator', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /gå til refleksjon/i }));
			expect(screen.getByText(/vurdering/i)).toBeInTheDocument();
		});
	});

	// ─── Info step ──────────────────────────────────────────────────────────────

	describe('Info step', () => {
		it('does not show weather section for INDOOR (default)', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.queryByText(/vær \(valgfritt\)/i)).not.toBeInTheDocument();
		});

		it('shows weather chips when environment is switched to OUTDOOR', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Ute' }));
			expect(screen.getByText(/vær \(valgfritt\)/i)).toBeInTheDocument();
		});

		it('hides weather section again when switching back to INDOOR', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Ute' }));
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Inne' }));
			expect(screen.queryByText(/vær \(valgfritt\)/i)).not.toBeInTheDocument();
		});

		it('weather chip can be toggled on and off', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Ute' }));
			const windChip = screen.getByRole('button', { name: /vind/i });
			await user.click(windChip);
			await user.click(windChip);
			expect(windChip).toBeInTheDocument();
		});

		it('pre-selects the favorite bow in create mode', () => {
			render(<PracticeFormModal {...defaultProps} bows={sampleBows} />);
			expect(screen.getByRole('button', { name: /bue/i })).toHaveTextContent('Win&Win Inno Max');
		});

		it('pre-selects the favorite arrows in create mode', () => {
			render(<PracticeFormModal {...defaultProps} arrows={sampleArrows} />);
			expect(screen.getByRole('button', { name: /^piler$/i })).toHaveTextContent('Easton X10');
		});

		it('shows "Slett trening" link in edit mode', () => {
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{ id: 'p1', date: '2025-01-08T00:00:00.000Z', arrowsShot: 36, environment: Environment.INDOOR, weather: [] }}
				/>
			);
			expect(screen.getByText(/slett trening/i)).toBeInTheDocument();
		});

		it('does not show "Slett trening" link in create mode', () => {
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.queryByText(/slett trening/i)).not.toBeInTheDocument();
		});
	});

	// ─── Rounds step ────────────────────────────────────────────────────────────

	describe('Rounds step', () => {
		it('shows one round by default', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			expect(screen.getByText('Runde 1')).toBeInTheDocument();
			expect(screen.queryByText('Runde 2')).not.toBeInTheDocument();
		});

		it('hides the remove button when there is only one round', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			expect(screen.queryByRole('button', { name: /fjern runde/i })).not.toBeInTheDocument();
		});

		it('adds a second round on "Legg til runde"', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			expect(screen.getByText('Runde 2')).toBeInTheDocument();
		});

		it('removes a round when the remove button is clicked', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			const removeButtons = screen.getAllByRole('button', { name: /fjern runde/i });
			await user.click(removeButtons[1]);
			expect(screen.queryByText('Runde 2')).not.toBeInTheDocument();
		});

		it('outdoor training: can add 5 rounds total', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			for (let i = 0; i < 4; i++) {
				await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			}
			expect(screen.getByText('Runde 5')).toBeInTheDocument();
		});

		it('disables add button and shows limit message at 20 rounds', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			for (let i = 0; i < 19; i++) {
				await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			}
			expect(screen.getByRole('button', { name: /legg til runde/i })).toBeDisabled();
			expect(screen.getByText(/maksimalt 20 runder/i)).toBeInTheDocument();
		});

		it('shows Avstand (fixed distance) field for SKIVE_INDOOR', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			expect(screen.getByRole('spinbutton', { name: /avstand/i })).toBeInTheDocument();
		});

		it('shows Fra/Til (range) fields for JAKT_3D category', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /kategori/i }));
			await user.click(screen.getByRole('option', { name: 'Jakt/3D' }));
			await goToStep(user, 1);
			expect(screen.getByRole('spinbutton', { name: 'Fra' })).toBeInTheDocument();
			expect(screen.getByRole('spinbutton', { name: 'Til' })).toBeInTheDocument();
			expect(screen.queryByRole('spinbutton', { name: /^avstand/i })).not.toBeInTheDocument();
		});

		it('shows Fra/Til (range) fields for FELT category', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /kategori/i }));
			await user.click(screen.getByRole('option', { name: 'Felt' }));
			await goToStep(user, 1);
			expect(screen.getByRole('spinbutton', { name: 'Fra' })).toBeInTheDocument();
			expect(screen.getByRole('spinbutton', { name: 'Til' })).toBeInTheDocument();
		});

		it('changing category resets rounds back to one', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			expect(screen.getByText('Runde 3')).toBeInTheDocument();
			await user.click(screen.getByRole('button', { name: /forrige steg/i }));
			await user.click(screen.getByRole('button', { name: /kategori/i }));
			await user.click(screen.getByRole('option', { name: 'Jakt/3D' }));
			await goToStep(user, 1);
			expect(screen.getByText('Runde 1')).toBeInTheDocument();
			expect(screen.queryByText('Runde 2')).not.toBeInTheDocument();
		});

		it('shows "Registrer score" button when arrows are configured', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 6,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 6, distanceMeters: 18, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			expect(screen.getByRole('button', { name: /registrer score/i })).toBeInTheDocument();
		});

		it('shows scoring progress on round card when arrows are partially scored', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 6,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 6, distanceMeters: 18, scores: [9, 8, 7] }],
					}}
				/>
			);
			await goToStep(user, 1);
			expect(screen.getByText(/3\/6 piler registrert/i)).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /fortsett scoring/i })).toBeInTheDocument();
		});
	});

	// ─── Scoring modal ──────────────────────────────────────────────────────────

	describe('Scoring modal', () => {
		it('opens scoring modal when "Registrer score" is clicked', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 6,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 6, distanceMeters: 18, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /registrer score/i }));
			expect(screen.getByText(/0 av 6 piler registrert/i)).toBeInTheDocument();
		});

		it('does NOT show X score button for INDOOR practice', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 3,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 3, distanceMeters: 18, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /registrer score/i }));
			expect(screen.queryByRole('button', { name: 'X' })).not.toBeInTheDocument();
		});

		it('shows X score button for OUTDOOR practice', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 3,
						environment: Environment.OUTDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 3, distanceMeters: 70, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /registrer score/i }));
			expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
		});

		it('records 3 arrows and shows completion banner with correct total', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 3,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 3, distanceMeters: 18, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /registrer score/i }));
			await user.click(screen.getByRole('button', { name: '9' }));
			await user.click(screen.getByRole('button', { name: '9' }));
			await user.click(screen.getByRole('button', { name: '9' }));
			const completeBanners = screen.getAllByText(/alle piler registrert/i);
			expect(completeBanners.length).toBeGreaterThanOrEqual(1);
			expect(screen.getAllByText(/score: 27/i).length).toBeGreaterThanOrEqual(1);
		});

		it('tracks progress as arrows are scored (outdoor with X)', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 6,
						environment: Environment.OUTDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 6, distanceMeters: 70, scores: [] }],
					}}
				/>
			);
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: /registrer score/i }));
			expect(screen.getByText(/0 av 6 piler registrert/i)).toBeInTheDocument();
			await user.click(screen.getByRole('button', { name: 'X' }));
			await user.click(screen.getByRole('button', { name: '10' }));
			await user.click(screen.getByRole('button', { name: '9' }));
			expect(screen.getByText(/3 av 6 piler registrert/i)).toBeInTheDocument();
		});

		it('hides score button when round has manual total score but no per-arrow scores', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 36,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 36, roundScore: 320 }],
					}}
				/>
			);
			await goToStep(user, 1);
			expect(screen.queryByRole('button', { name: /registrer score/i })).not.toBeInTheDocument();
			expect(screen.queryByRole('button', { name: /fortsett scoring/i })).not.toBeInTheDocument();
		});
	});

	// ─── Reflection step ────────────────────────────────────────────────────────

	describe('Reflection step', () => {
		it('shows rating buttons 1–10', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			for (let i = 1; i <= 10; i++) {
				expect(screen.getByRole('button', { name: `Vurdering ${i} av 10` })).toBeInTheDocument();
			}
		});

		it('clicking a rating button marks it as pressed (aria-pressed=true)', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			const btn = screen.getByRole('button', { name: 'Vurdering 7 av 10' });
			await user.click(btn);
			expect(btn).toHaveAttribute('aria-pressed', 'true');
		});

		it('clicking a different rating deselects the previous one', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			const btn7 = screen.getByRole('button', { name: 'Vurdering 7 av 10' });
			const btn9 = screen.getByRole('button', { name: 'Vurdering 9 av 10' });
			await user.click(btn7);
			await user.click(btn9);
			expect(btn7).toHaveAttribute('aria-pressed', 'false');
			expect(btn9).toHaveAttribute('aria-pressed', 'true');
		});

		it('clicking the same rating twice deselects it', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			const btn = screen.getByRole('button', { name: 'Vurdering 5 av 10' });
			await user.click(btn);
			await user.click(btn);
			expect(btn).toHaveAttribute('aria-pressed', 'false');
		});

		it('shows the notes textarea', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			expect(screen.getByLabelText('Notater')).toBeInTheDocument();
		});

		it('can type notes in the textarea', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await goToStep(user, 2);
			const textarea = screen.getByLabelText('Notater');
			await user.type(textarea, 'Bra dag på banen!');
			expect(textarea).toHaveValue('Bra dag på banen!');
		});
	});

	// ─── Submission ─────────────────────────────────────────────────────────────

	describe('form submission', () => {
		it('calls onSave and onClose after successful submit', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const onClose = jest.fn();
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} onClose={onClose} />);
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
			await waitFor(() => expect(onClose).toHaveBeenCalled());
		});

		it('passes environment OUTDOOR and selected weather conditions to onSave', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} />);
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Ute' }));
			await user.click(screen.getByRole('button', { name: /sol/i }));
			await user.click(screen.getByRole('button', { name: /vind/i }));
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() =>
				expect(onSave).toHaveBeenCalledWith(
					expect.objectContaining({
						environment: 'OUTDOOR',
						weather: expect.arrayContaining(['SUN', 'WIND']),
					})
				)
			);
		});

		it('passes rating and notes from the reflection step to onSave', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} />);
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: 'Vurdering 8 av 10' }));
			await user.type(screen.getByLabelText('Notater'), 'Veldig bra sesjon!');
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ rating: 8, notes: 'Veldig bra sesjon!' })));
		});

		it('passes bowId and arrowsId of favorites to onSave', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} bows={sampleBows} arrows={sampleArrows} />);
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ bowId: 'bow-2', arrowsId: 'arr-1' })));
		});

		it('passes JAKT_3D practiceCategory to onSave', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} />);
			await user.click(screen.getByRole('button', { name: /kategori/i }));
			await user.click(screen.getByRole('option', { name: 'Jakt/3D' }));
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ practiceCategory: 'JAKT_3D' })));
		});

		it('shows error message in reflection step when onSave rejects', async () => {
			const onSave = jest.fn().mockRejectedValue(new Error('Nettverksfeil'));
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} />);
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));
			await waitFor(() => expect(screen.getByText('Nettverksfeil')).toBeInTheDocument());
		});

		it('shows "Lagre endringer" button label in edit mode', async () => {
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					mode="edit"
					practice={{ id: 'p1', date: '2025-01-08T00:00:00.000Z', arrowsShot: 36, environment: Environment.INDOOR, weather: [] }}
				/>
			);
			await goToStep(user, 2);
			expect(screen.getByRole('button', { name: /lagre endringer/i })).toBeInTheDocument();
		});

		it('full outdoor training: category, weather, many rounds, rating, notes → onSave', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onSave={onSave} bows={sampleBows} arrows={sampleArrows} />);

			// Step 0 – Info
			await user.click(screen.getByRole('button', { name: /kategori/i }));
			await user.click(screen.getByRole('option', { name: 'Skive utendørs' }));
			await user.click(screen.getByRole('button', { name: /miljø/i }));
			await user.click(screen.getByRole('option', { name: 'Ute' }));
			await user.click(screen.getByRole('button', { name: /sol/i }));
			await user.click(screen.getByRole('button', { name: /regn/i }));

			// Step 1 – add 4 more rounds (5 total)
			await goToStep(user, 1);
			for (let i = 0; i < 4; i++) {
				await user.click(screen.getByRole('button', { name: /legg til runde/i }));
			}
			expect(screen.getByText('Runde 5')).toBeInTheDocument();

			// Step 2 – Refleksjon
			await goToStep(user, 1);
			await user.click(screen.getByRole('button', { name: 'Vurdering 9 av 10' }));
			await user.type(screen.getByLabelText('Notater'), 'Fem runder utendørs, sol og litt regn!');
			await user.click(screen.getByRole('button', { name: /lagre trening/i }));

			await waitFor(() =>
				expect(onSave).toHaveBeenCalledWith(
					expect.objectContaining({
						environment: 'OUTDOOR',
						practiceCategory: 'SKIVE_OUTDOOR',
						weather: expect.arrayContaining(['SUN', 'RAIN']),
						rating: 9,
						notes: 'Fem runder utendørs, sol og litt regn!',
					})
				)
			);
		});
	});

	// ─── Edit mode pre-population ───────────────────────────────────────────────

	describe('edit mode pre-population', () => {
		const editPractice = {
			id: 'p1',
			date: '2025-03-15T00:00:00.000Z',
			arrowsShot: 72,
			location: 'Drammen bueskytterklubb',
			environment: Environment.OUTDOOR,
			weather: ['SUN' as const, 'WIND' as const],
			practiceCategory: 'SKIVE_OUTDOOR' as const,
			notes: 'God trening',
			rating: 9,
			bowId: 'bow-1',
			arrowsId: 'arr-1',
			ends: [
				{ id: 'e1', arrows: 36, distanceMeters: 50, scores: Array(6).fill(9), targetType: '122cm' },
				{ id: 'e2', arrows: 36, distanceMeters: 30, scores: Array(6).fill(8), targetType: '80cm' },
			],
		};

		it('pre-fills the location input', () => {
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			expect(screen.getByDisplayValue('Drammen bueskytterklubb')).toBeInTheDocument();
		});

		it('pre-selects the bow from the existing practice', () => {
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			expect(screen.getByRole('button', { name: /bue/i })).toHaveTextContent('Hoyt Xceed');
		});

		it('pre-selects the arrows from the existing practice', () => {
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			expect(screen.getByRole('button', { name: /^piler$/i })).toHaveTextContent('Easton X10');
		});

		it('loads two rounds from existing ends', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			await goToStep(user, 1);
			expect(screen.getByText('Runde 1')).toBeInTheDocument();
			expect(screen.getByText('Runde 2')).toBeInTheDocument();
			expect(screen.queryByText('Runde 3')).not.toBeInTheDocument();
		});

		it('shows scoring progress on round cards for partially scored rounds', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			await goToStep(user, 1);
			expect(screen.getAllByText(/6\/36 piler registrert/i)).toHaveLength(2);
		});

		it('pre-fills rating 9 on the reflection step', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			await goToStep(user, 2);
			expect(screen.getByRole('button', { name: 'Vurdering 9 av 10' })).toHaveAttribute('aria-pressed', 'true');
		});

		it('pre-fills notes on the reflection step', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />);
			await goToStep(user, 2);
			expect(screen.getByLabelText('Notater')).toHaveValue('God trening');
		});

		it('re-initialises to fresh state when opened in create mode after edit', async () => {
			const { rerender } = render(
				<PracticeFormModal {...defaultProps} mode="edit" practice={editPractice} bows={sampleBows} arrows={sampleArrows} />
			);
			rerender(<PracticeFormModal {...defaultProps} open={false} mode="create" />);
			rerender(<PracticeFormModal {...defaultProps} open={true} mode="create" />);
			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});
	});

	// ─── Discard confirmation ───────────────────────────────────────────────────

	describe('discard confirmation dialog', () => {
		it('clicking Lukk opens the discard confirmation dialog', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} />);
			await user.click(screen.getByRole('button', { name: /lukk/i }));
			expect(screen.getByRole('dialog', { name: /forkast endringer/i })).toBeInTheDocument();
		});

		it('confirming discard calls onClose', async () => {
			const onClose = jest.fn();
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onClose={onClose} />);
			await user.click(screen.getByRole('button', { name: /lukk/i }));
			const discardDialog = screen.getByRole('dialog', { name: /forkast endringer/i });
			await user.click(within(discardDialog).getByRole('button', { name: /forkast/i }));
			expect(onClose).toHaveBeenCalled();
		});

		it('cancelling discard keeps the form open without calling onClose', async () => {
			const onClose = jest.fn();
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} onClose={onClose} />);
			await user.click(screen.getByRole('button', { name: /lukk/i }));
			const discardDialog = screen.getByRole('dialog', { name: /forkast endringer/i });
			await user.click(within(discardDialog).getByRole('button', { name: /fortsett/i }));
			expect(onClose).not.toHaveBeenCalled();
			expect(screen.getByRole('dialog', { name: /ny trening/i })).toBeInTheDocument();
		});
	});

	// ─── Delete confirmation ────────────────────────────────────────────────────

	describe('delete confirmation dialog', () => {
		const practiceToDelete = {
			id: 'p1',
			date: '2025-01-08T00:00:00.000Z',
			arrowsShot: 36,
			environment: Environment.INDOOR,
			weather: [] as never[],
		};

		beforeEach(() => {
			global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
		});

		afterEach(() => {
			delete (global as Record<string, unknown>).fetch;
		});

		it('clicking "Slett trening" opens the delete confirmation dialog', async () => {
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={practiceToDelete} />);
			await user.click(screen.getByText(/slett trening/i));
			expect(screen.getByRole('dialog', { name: /slett trening/i })).toBeInTheDocument();
			expect(screen.getByText(/er du sikker/i)).toBeInTheDocument();
		});

		it('confirming delete calls DELETE endpoint, onDeleted, and onClose', async () => {
			const onDeleted = jest.fn();
			const onClose = jest.fn();
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={practiceToDelete} onDeleted={onDeleted} onClose={onClose} />);
			await user.click(screen.getByText(/slett trening/i));
			const deleteDialog = screen.getByRole('dialog', { name: /slett trening/i });
			await user.click(within(deleteDialog).getByRole('button', { name: /^slett$/i }));
			await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/practices/p1', { method: 'DELETE' }));
			await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('p1'));
			await waitFor(() => expect(onClose).toHaveBeenCalled());
		});

		it('cancelling delete does not call onClose', async () => {
			const onClose = jest.fn();
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={practiceToDelete} onClose={onClose} />);
			await user.click(screen.getByText(/slett trening/i));
			const deleteDialog = screen.getByRole('dialog', { name: /slett trening/i });
			await user.click(within(deleteDialog).getByRole('button', { name: /avbryt/i }));
			expect(onClose).not.toHaveBeenCalled();
		});

		it('shows error in reflection step when the delete API call fails', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false } as Response);
			const user = userEvent.setup();
			render(<PracticeFormModal {...defaultProps} mode="edit" practice={practiceToDelete} />);
			await user.click(screen.getByText(/slett trening/i));
			const deleteDialog = screen.getByRole('dialog', { name: /slett trening/i });
			await user.click(within(deleteDialog).getByRole('button', { name: /^slett$/i }));
			await waitFor(() => expect(screen.queryByRole('dialog', { name: /slett trening/i })).not.toBeInTheDocument());
			await user.click(screen.getByRole('button', { name: /gå til refleksjon/i }));
			expect(screen.getByText(/kunne ikke slette trening/i)).toBeInTheDocument();
		});
	});

	// ─── localStorage integration ────────────────────────────────────────────────

	describe('localStorage integration', () => {
		it('reads last distance and target from localStorage on create', () => {
			window.localStorage.setItem('bueboka_last_distance', '18');
			window.localStorage.setItem('bueboka_last_target', '40cm');
			render(<PracticeFormModal {...defaultProps} />);
			expect(screen.getByRole('dialog', { name: /ny trening/i })).toBeInTheDocument();
		});

		it('saves last distance and target to localStorage after a successful submit', async () => {
			const onSave = jest.fn().mockResolvedValue(undefined);
			const user = userEvent.setup();
			render(
				<PracticeFormModal
					{...defaultProps}
					onSave={onSave}
					mode="edit"
					practice={{
						id: 'p1',
						date: '2025-01-08T00:00:00.000Z',
						arrowsShot: 36,
						environment: Environment.INDOOR,
						weather: [],
						ends: [{ id: 'e1', arrows: 36, distanceMeters: 18, targetType: '40cm' }],
					}}
				/>
			);
			await goToStep(user, 2);
			await user.click(screen.getByRole('button', { name: /lagre endringer/i }));
			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(window.localStorage.getItem('bueboka_last_distance')).toBe('18');
			expect(window.localStorage.getItem('bueboka_last_target')).toBe('40cm');
		});
	});
});
