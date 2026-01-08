import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from './TextArea';

describe('TextArea', () => {
	test('renders label and allows typing', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render(<TextArea label="Notater" onChange={onChange} placeholder="Skriv..." />);
		const el = screen.getByLabelText('Notater');
		await user.type(el, 'Hei');
		expect(onChange).toHaveBeenCalled();
	});

	test('renders help and error and wires aria attributes', () => {
		render(<TextArea label="Notater" helpText="Hjelp" errorMessage="Feil" />);
		const el = screen.getByLabelText('Notater');
		expect(el).toHaveAttribute('aria-invalid', 'true');
		expect(el).toHaveAttribute('aria-describedby');
		expect(screen.getByText('Hjelp')).toBeInTheDocument();
		expect(screen.getByText('Feil')).toBeInTheDocument();
	});
});
