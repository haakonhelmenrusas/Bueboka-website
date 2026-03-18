import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from '@/components';

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
			startEmpty={props.startEmpty}
		/>
	);
}

describe('NumberInput', () => {
	test('renders label and current value', () => {
		render(<Harness value={5} />);
		expect(screen.getByText('Antall')).toBeInTheDocument();
		expect(screen.getByRole('spinbutton')).toHaveDisplayValue('5');
	});

	test('typing clamps to min/max', async () => {
		const user = userEvent.setup();
		render(<Harness value={5} min={0} max={10} />);

		const input = screen.getByRole('spinbutton');
		await user.clear(input);
		await user.type(input, '99');
		expect(input).toHaveDisplayValue('10');
	});

	test('can be cleared so the user can type without deleting an initial value', async () => {
		const user = userEvent.setup();
		render(<Harness value={0} emptyBehavior="ignore" />);

		const input = screen.getByRole('spinbutton');
		await user.clear(input);
		expect(input).toHaveDisplayValue('');

		await user.type(input, '12');
		expect(input).toHaveDisplayValue('12');
	});

	test('unit renders', () => {
		render(<Harness value={12} unit="m" />);
		expect(screen.getByText('m')).toBeInTheDocument();
	});

	test('disabled prevents interactions', () => {
		render(<Harness value={3} disabled />);
		expect(screen.getByRole('spinbutton')).toBeDisabled();
	});

	test('help and error text are linked via aria-describedby', () => {
		render(<Harness value={1} helpText="Hjelpetekst" errorMessage="Feil" />);
		const input = screen.getByRole('spinbutton');
		const described = input.getAttribute('aria-describedby');
		expect(described).toBeTruthy();
		expect(screen.getByText('Hjelpetekst')).toBeInTheDocument();
		expect(screen.getByText('Feil')).toBeInTheDocument();
	});

	test('startEmpty renders empty when initial value is 0', () => {
		render(<Harness value={0} startEmpty emptyBehavior="ignore" />);
		const input = screen.getByRole('spinbutton');
		expect(input).toHaveDisplayValue('');
	});
});
