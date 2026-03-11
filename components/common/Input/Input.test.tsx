import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
	test('renders label and associates it with the input', () => {
		render(<Input label="Navn" id="name" name="name" />);
		expect(screen.getByText('Navn')).toBeInTheDocument();
		expect(screen.getByLabelText('Navn')).toBeInTheDocument();
	});

	test('renders help text and error message and wires aria-describedby', () => {
		render(<Input label="E-post" id="email" helpText="Skriv inn e-post" errorMessage="Ugyldig" />);
		const input = screen.getByLabelText('E-post');
		expect(screen.getByText('Skriv inn e-post')).toBeInTheDocument();
		expect(screen.getByText('Ugyldig')).toBeInTheDocument();
		expect(input).toHaveAttribute('aria-describedby');
		expect(input).toHaveAttribute('aria-invalid', 'true');
	});

	test('calls onChange when user types', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render(<Input label="Navn" onChange={onChange} />);
		await user.type(screen.getByLabelText('Navn'), 'Hei');
		expect(onChange).toHaveBeenCalled();
	});

	test('renders left and right addons', () => {
		render(<Input label="Beløp" leftAddon={<span>kr</span>} rightAddon={<span>.00</span>} />);
		expect(screen.getByText('kr')).toBeInTheDocument();
		expect(screen.getByText('.00')).toBeInTheDocument();
	});
});
