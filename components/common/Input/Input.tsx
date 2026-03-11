'use client';
import React, { useId, useMemo } from 'react';
import styles from './InputStyles.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	/** Backwards compatible: if true, show errorMessage */
	error?: boolean;
	errorMessage?: string;
	helpText?: string;
	optional?: boolean;
	containerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;
	/** legacy left icon */
	icon?: React.ReactNode;
	/** new: content rendered inside the input on the left */
	leftAddon?: React.ReactNode;
	/** new: content rendered inside the input on the right */
	rightAddon?: React.ReactNode;
}

/**
 * Input component with label, optional icon, and error message.
 *
 * @param label - label text
 * @param error - if true, an error message will be displayed
 * @param errorMessage - error message to be displayed
 * @param helpText - help text to be displayed below the input
 * @param containerClassName - custom CSS class for the container
 * @param labelClassName - custom CSS class for the label
 * @param inputClassName - custom CSS class for the input
 * @param icon - icon to be displayed on the left side of the input
 * @param leftAddon - content to be rendered inside the input on the left
 * @param rightAddon - content to be rendered inside the input on the right
 * @param props - other input props
 * @returns Input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			errorMessage,
			helpText,
			optional,
			containerClassName,
			labelClassName,
			inputClassName,
			icon,
			leftAddon,
			rightAddon,
			id,
			...props
		},
		ref
	) => {
		const autoId = useId();
		const inputId = id ?? `input-${autoId}`;
		const showError = Boolean(errorMessage) || Boolean(error);

		const describedById = useMemo(() => {
			const ids: string[] = [];
			if (helpText) ids.push(`${inputId}-help`);
			if (showError && errorMessage) ids.push(`${inputId}-error`);
			return ids.length ? ids.join(' ') : undefined;
		}, [errorMessage, helpText, inputId, showError]);

		return (
			<div className={`${styles.container} ${containerClassName || ''}`}>
				<label htmlFor={inputId} className={`${styles.label} ${labelClassName || ''}`}>
					{label}
					{optional ? <span className={styles.optional}> (valgfritt)</span> : null}
				</label>

				{helpText ? (
					<div id={`${inputId}-help`} className={styles.help}>
						{helpText}
					</div>
				) : null}

				<div className={`${styles.control} ${showError ? styles.error : ''} ${props.disabled ? styles.disabled : ''}`}>
					{icon || leftAddon ? <div className={styles.left}>{icon ?? leftAddon}</div> : null}
					<input
						ref={ref}
						id={inputId}
						data-testid="input"
						className={`${styles.input} ${inputClassName || ''}`}
						aria-invalid={showError ? 'true' : 'false'}
						aria-describedby={describedById}
						{...props}
					/>
					{rightAddon ? <div className={styles.right}>{rightAddon}</div> : null}
				</div>

				{showError && errorMessage ? (
					<div id={`${inputId}-error`} className={styles.errorMessage}>
						{errorMessage}
					</div>
				) : null}
			</div>
		);
	}
);

Input.displayName = 'Input';
