import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
	test('renders label and current value', () => {
		render(
			<Select
				label="Miljø"
				value="OUTDOOR"
				onChange={() => {}}
				options={[
					{ value: 'INDOOR', label: 'Inne' },
					{ value: 'OUTDOOR', label: 'Ute' },
				]}
			/>
		);

		expect(screen.getByText('Miljø')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /miljø/i })).toBeInTheDocument();
		expect(screen.getByText('Ute')).toBeInTheDocument();
	});

	test('shows placeholder label when nothing selected', () => {
		render(
			<Select label="Runde" value={''} onChange={() => {}} placeholderLabel="Velg runde" options={[{ value: '1', label: 'Runde 1' }]} />
		);
		expect(screen.getByText('Velg runde')).toBeInTheDocument();
	});

	test('opening and selecting triggers onChange', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render(
			<Select
				label="Miljø"
				value="INDOOR"
				onChange={onChange}
				options={[
					{ value: 'INDOOR', label: 'Inne' },
					{ value: 'OUTDOOR', label: 'Ute' },
				]}
			/>
		);

		await user.click(screen.getByRole('button', { name: /miljø/i }));
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		await user.click(screen.getByRole('option', { name: 'Ute' }));
		expect(onChange).toHaveBeenCalledWith('OUTDOOR');
	});

	test('help and error are wired via aria-describedby on the button', () => {
		render(
			<Select
				label="Miljø"
				value="OUTDOOR"
				onChange={() => {}}
				helpText="Velg inne eller ute"
				errorMessage="Påkrevd"
				options={[{ value: 'OUTDOOR', label: 'Ute' }]}
			/>
		);
		const el = screen.getByRole('button', { name: /miljø/i });
		expect(el).toHaveAttribute('aria-invalid', 'true');
		expect(el).toHaveAttribute('aria-describedby');
		expect(screen.getByText('Velg inne eller ute')).toBeInTheDocument();
		expect(screen.getByText('Påkrevd')).toBeInTheDocument();
	});

	test('renders icon for selected option and in menu options', async () => {
		const user = userEvent.setup();
		const icon = <span data-testid="ico">I</span>;
		render(
			<Select
				label="Miljø"
				value="INDOOR"
				onChange={() => {}}
				options={[
					{ value: 'INDOOR', label: 'Inne', icon },
					{ value: 'OUTDOOR', label: 'Ute' },
				]}
			/>
		);

		expect(screen.getAllByTestId('ico').length).toBeGreaterThan(0);
		await user.click(screen.getByRole('button', { name: /miljø/i }));
		expect(screen.getAllByTestId('ico').length).toBeGreaterThan(0);
	});

	test('shows empty text when there are no options', async () => {
		const user = userEvent.setup();
		render(<Select label="Runde" value={''} onChange={() => {}} placeholderLabel="Velg" emptyText="Ingen runder" options={[]} />);
		await user.click(screen.getByRole('button', { name: /runde/i }));
		expect(screen.getByText('Ingen runder')).toBeInTheDocument();
	});

	test('supports multiple select (toggles options and shows summary)', async () => {
		const user = userEvent.setup();
		const Wrapper = () => {
			const [val, setVal] = React.useState<string[]>([]);
			return (
				<Select
					label="Vær"
					value={val}
					onChange={(v) => setVal(v as string[])}
					multiple
					placeholderLabel="Velg vær"
					options={[
						{ value: 'SUN', label: 'Sol' },
						{ value: 'RAIN', label: 'Regn' },
						{ value: 'WIND', label: 'Vind' },
					]}
				/>
			);
		};

		render(<Wrapper />);

		const button = screen.getByRole('button', { name: /vær/i });
		expect(button).toHaveTextContent('Velg vær');

		await user.click(button);
		await user.click(screen.getByRole('option', { name: 'Sol' }));
		expect(button).toHaveTextContent('Sol');

		await user.click(screen.getByRole('option', { name: 'Regn' }));
		expect(button).toHaveTextContent('Sol, Regn');

		// toggle off
		await user.click(screen.getByRole('option', { name: 'Sol' }));
		expect(button).toHaveTextContent('Regn');
	});
});
