import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from './NumberInput';

function Harness(props: Partial<React.ComponentProps<typeof NumberInput>>) {
	const [value, setValue] = React.useState(props.value ?? 0);
	return (
		<NumberInput
			label={props.label ?? 'Antall'}
			value={value}
			onChange={(v) => {
				setValue(v);
				props.onChange?.(v);
			}}
			min={props.min}
			max={props.max}
			step={props.step}
			disabled={props.disabled}
			required={props.required}
			helpText={props.helpText}
			errorMessage={props.errorMessage}
			unit={props.unit}
			emptyBehavior={props.emptyBehavior}
		/>
	);
}

describe('NumberInput', () => {
	test('renders label and current value', () => {
		render(<Harness value={5} />);
		expect(screen.getByText('Antall')).toBeInTheDocument();
		expect(screen.getByRole('spinbutton')).toHaveValue(5);
	});

	test('increment/decrement buttons change value', async () => {
		const user = userEvent.setup();
		render(<Harness value={2} step={2} />);

		await user.click(screen.getByRole('button', { name: /increase antall/i }));
		expect(screen.getByRole('spinbutton')).toHaveValue(4);

		await user.click(screen.getByRole('button', { name: /decrease antall/i }));
		expect(screen.getByRole('spinbutton')).toHaveValue(2);
	});

	test('respects min/max for steppers', async () => {
		const user = userEvent.setup();
		render(<Harness value={0} min={0} max={1} step={1} />);

		expect(screen.getByRole('button', { name: /decrease antall/i })).toBeDisabled();
		await user.click(screen.getByRole('button', { name: /increase antall/i }));
		expect(screen.getByRole('spinbutton')).toHaveValue(1);
		expect(screen.getByRole('button', { name: /increase antall/i })).toBeDisabled();
	});

	test('typing clamps to min/max', async () => {
		const user = userEvent.setup();
		render(<Harness value={5} min={0} max={10} />);

		const input = screen.getByRole('spinbutton');
		await user.clear(input);
		await user.type(input, '99');
		expect(input).toHaveValue(10);
	});

	test('unit renders', () => {
		render(<Harness value={12} unit="m" />);
		expect(screen.getByText('m')).toBeInTheDocument();
	});

	test('disabled prevents changes', async () => {
		const user = userEvent.setup();
		render(<Harness value={3} disabled />);

		await user.click(screen.getByRole('button', { name: /increase antall/i }));
		expect(screen.getByRole('spinbutton')).toHaveValue(3);
	});

	test('help and error text are linked via aria-describedby', () => {
		render(<Harness value={1} helpText="Hjelpetekst" errorMessage="Feil" />);
		const input = screen.getByRole('spinbutton');
		const described = input.getAttribute('aria-describedby');
		expect(described).toBeTruthy();
		expect(screen.getByText('Hjelpetekst')).toBeInTheDocument();
		expect(screen.getByText('Feil')).toBeInTheDocument();
	});
});
