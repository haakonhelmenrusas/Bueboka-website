import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateInput } from './DateInput';

describe('DateInput', () => {
	test('renders and allows typing a date', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render(<DateInput label="Dato" onChange={onChange} />);
		const input = screen.getByLabelText('Dato');
		await user.type(input, '2026-01-08');
		expect(onChange).toHaveBeenCalled();
	});
});
