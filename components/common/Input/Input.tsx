'use client';
import React, { useState } from 'react';
import styles from './InputStyles.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: boolean;
	errorMessage?: string;
	placeholderText?: string;
	containerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;
	icon?: React.ReactNode;
}

/**
 * Input component with label, optional icon, and error message.
 *
 * @param label - label text
 * @param error - if true, an error message will be displayed
 * @param errorMessage - error message to be displayed
 * @param placeholderText - placeholder text for the input
 * @param containerClassName - custom CSS class for the container
 * @param labelClassName - custom CSS class for the label
 * @param inputClassName - custom CSS class for the input
 * @param icon - icon to be displayed on the left side of the input
 * @param props - other input props
 * @returns Input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ label, error, errorMessage, placeholderText, containerClassName, labelClassName, inputClassName, icon, ...props }, ref) => {
		const [isFocused, setIsFocused] = useState(false);

		return (
			<div className={`${styles.container} ${containerClassName || ''}`} role="group" aria-label={label}>
				<div className={`${styles.labelContainer} ${labelClassName || ''}`}>
					{icon && <div className={styles.icon}>{icon}</div>}
					<label className={styles.label}>{label}</label>
				</div>
				<input
					ref={ref}
					data-testid="input"
					className={`${styles.input} ${inputClassName || ''}`}
					placeholder={isFocused ? '' : placeholderText}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					{...props}
				/>
				{error && <span className={styles.errorMessage}>{errorMessage}</span>}
			</div>
		);
	}
);

Input.displayName = 'Input';
