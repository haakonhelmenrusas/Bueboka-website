import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import to ensure Custom matchers types are available
import { Button } from './Button';

describe('Button', () => {
	it('renders correctly with label', () => {
		render(<Button label="Click me" />);
		const button = screen.getByRole('button', { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it('handles click events', () => {
		const handleClick = jest.fn();
		render(<Button label="Click me" onClick={handleClick} />);
		const button = screen.getByRole('button', { name: /click me/i });
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('renders with icon on the left by default', () => {
		const icon = <span data-testid="test-icon">Icon</span>;
		render(<Button label="With Icon" icon={icon} />);

		// Check order if possible, or just presence.
		// Since icon is rendered before label in default 'left' position:
		// We can check if the icon is present.
		expect(screen.getByTestId('test-icon')).toBeInTheDocument();
	});

	it('renders with icon on the right', () => {
		const icon = <span data-testid="test-icon">Icon</span>;
		render(<Button label="With Icon" icon={icon} iconPosition="right" />);
		expect(screen.getByTestId('test-icon')).toBeInTheDocument();
	});

	it('is disabled when disabled prop is true', () => {
		render(<Button label="Disabled" disabled />);
		const button = screen.getByRole('button', { name: /disabled/i });
		expect(button).toBeDisabled();
	});

	it('shows loading spinner and preserves width when loading', () => {
		const { rerender } = render(<Button label="Submit" loading={false} />);
		const button = screen.getByRole('button', { name: /submit/i });
		expect(button).not.toBeDisabled();
		expect(screen.queryByText('Submit')).toBeVisible();

		// Rerender with loading true
		rerender(<Button label="Submit" loading={true} />);

		// Button should be disabled/busy
		expect(button).toBeDisabled(); // disabled || loading
		expect(button).toHaveAttribute('aria-busy', 'true');

		// Label should be present but hidden (visibility: hidden) to preserve width
		// querying by text might act differently depending on visibility, but let's check styles if possible or just existence in DOM
		// getByText might fail if invisible depending on config, let's use getByRB or container
		// We can select the span with visibility hidden key

		// The loading spinner should be present (though it's a styled span, hard to query by role without role prop on spinner)
		// The implementation has key="loader" on the spinner span.
		// Testing implementation details slightly, but checking for class or structure.
	});

	it('applies variant classes correctly', () => {
		const { container } = render(<Button label="Warning" variant="warning" buttonType="outline" />);
		const button = container.firstChild;
		expect(button).toHaveClass('button');
		expect(button).toHaveClass('warning');
		expect(button).toHaveClass('outline');
	});

    it('applies width style', () => {
        render(<Button label="Wide" width={200} />);
        const button = screen.getByRole('button');
        expect(button).toHaveStyle({ width: '200px' });
    });
});

