'use client';

import React, { useId, useMemo } from 'react';
import styles from './TextArea.module.css';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string;
	helpText?: string;
	errorMessage?: string;
	optional?: boolean;
	containerClassName?: string;
	labelClassName?: string;
	textAreaClassName?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ label, helpText, errorMessage, optional, containerClassName, labelClassName, textAreaClassName, id, ...props }, ref) => {
		const autoId = useId();
		const textAreaId = id ?? `textarea-${autoId}`;
		const describedById = useMemo(() => {
			const ids: string[] = [];
			if (helpText) ids.push(`${textAreaId}-help`);
			if (errorMessage) ids.push(`${textAreaId}-error`);
			return ids.length ? ids.join(' ') : undefined;
		}, [errorMessage, helpText, textAreaId]);

		return (
			<div className={`${styles.container} ${containerClassName || ''}`}>
				<label htmlFor={textAreaId} className={`${styles.label} ${labelClassName || ''}`}>
					{label}
					{optional ? <span className={styles.optional}> (valgfritt)</span> : null}
				</label>

				{helpText ? (
					<div id={`${textAreaId}-help`} className={styles.help}>
						{helpText}
					</div>
				) : null}

				<div className={`${styles.control} ${errorMessage ? styles.error : ''} ${props.disabled ? styles.disabled : ''}`}>
					<textarea
						ref={ref}
						id={textAreaId}
						className={`${styles.textarea} ${textAreaClassName || ''}`}
						aria-invalid={errorMessage ? 'true' : 'false'}
						aria-describedby={describedById}
						{...props}
					/>
				</div>

				{errorMessage ? (
					<div id={`${textAreaId}-error`} className={styles.errorMessage}>
						{errorMessage}
					</div>
				) : null}
			</div>
		);
	}
);

TextArea.displayName = 'TextArea';
