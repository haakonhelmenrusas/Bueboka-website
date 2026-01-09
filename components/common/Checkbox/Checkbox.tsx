'use client';

import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
	id?: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	helpText?: string;
	disabled?: boolean;
	required?: boolean;
	containerClassName?: string;
	name?: string;
	inlineLabel?: boolean;
}

export function Checkbox({
	id,
	label,
	checked,
	onChange,
	helpText,
	disabled,
	required,
	containerClassName,
	name,
	inlineLabel = true,
}: CheckboxProps) {
	const inputId = id ?? React.useId();

	return (
		<label className={`${styles.container} ${inlineLabel ? styles.inline : ''} ${containerClassName ?? ''}`.trim()} htmlFor={inputId}>
			<span className={styles.controlRow}>
				<input
					id={inputId}
					name={name}
					type="checkbox"
					className={styles.input}
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
				/>
				<span className={styles.box} aria-hidden="true" />
				<span className={styles.label}>
					{label}
					{required ? <span className={styles.required}>*</span> : null}
				</span>
			</span>

			{helpText ? <span className={styles.helpText}>{helpText}</span> : null}
		</label>
	);
}
