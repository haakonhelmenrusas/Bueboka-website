'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import styles from './NumberInput.module.css';

export interface NumberInputProps {
	label: React.ReactNode;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	required?: boolean;
	helpText?: React.ReactNode;
	errorMessage?: string;
	/** Optional unit label, e.g. "m", "kg". */
	unit?: string;
	/**
	 * How to treat empty input. Defaults to "clamp" (turns empty into min/0).
	 * Use "ignore" to keep value unchanged when input is cleared.
	 */
	emptyBehavior?: 'clamp' | 'ignore';
	/** If true, the input starts visually empty when the initial value is 0 (better UX for count fields). */
	startEmpty?: boolean;
	name?: string;
	id?: string;
	containerClassName?: string;
	inputClassName?: string;
	/** Optional right addon, e.g. a tooltip or icon. */
	rightAddon?: React.ReactNode;
	/** Called when the input is cleared to empty string. Useful for nullable numeric fields. */
	onEmpty?: () => void;
}

const clamp = (n: number, min?: number, max?: number) => {
	let v = n;
	if (typeof min === 'number') v = Math.max(min, v);
	if (typeof max === 'number') v = Math.min(max, v);
	return v;
};

const roundToOneDecimal = (n: number): number => {
	return Math.round(n * 10) / 10;
};

export const NumberInput: React.FC<NumberInputProps> = ({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	disabled,
	required,
	helpText,
	errorMessage,
	unit,
	emptyBehavior = 'clamp',
	startEmpty = false,
	name,
	id,
	containerClassName,
	inputClassName,
	rightAddon,
	onEmpty,
}) => {
	const autoId = useId();
	const inputId = id ?? `number-input-${autoId}`;
	const describedById = useMemo(() => {
		const ids: string[] = [];
		if (helpText) ids.push(`${inputId}-help`);
		if (errorMessage) ids.push(`${inputId}-error`);
		return ids.length ? ids.join(' ') : undefined;
	}, [errorMessage, helpText, inputId]);

	// Keep a separate string state so the field can be empty while the stored value remains numeric.
	const [displayValue, setDisplayValue] = useState<string>(() => {
		if (startEmpty && value === 0) return '';
		return Number.isFinite(value) ? String(value) : '';
	});

	// Track first sync so we don't immediately overwrite startEmpty with "0".
	const didInitRef = React.useRef(false);

	useEffect(() => {
		if (!didInitRef.current) {
			didInitRef.current = true;
			if (startEmpty && value === 0) return;
		}
		setDisplayValue(Number.isFinite(value) ? String(value) : '');
	}, [value, startEmpty]);

	const dec = () => {
		if (disabled) return;
		const next = roundToOneDecimal(clamp(value - step, min, max));
		onChange(next);
		setDisplayValue(String(next));
	};

	const inc = () => {
		if (disabled) return;
		const next = roundToOneDecimal(clamp(value + step, min, max));
		onChange(next);
		setDisplayValue(String(next));
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		const raw = e.target.value;
		setDisplayValue(raw);

		if (raw === '') {
			onEmpty?.();
			if (emptyBehavior === 'ignore') return;
			const fallback = typeof min === 'number' ? min : 0;
			onChange(clamp(fallback, min, max));
			return;
		}

		const parsed = Number(raw);
		if (Number.isNaN(parsed)) return;
		const next = roundToOneDecimal(clamp(parsed, min, max));
		onChange(next);
		// If clamping changed the value, reflect it immediately.
		if (next !== parsed) setDisplayValue(String(next));
	};

	const handleBlur = () => {
		if (disabled) return;
		if (displayValue === '') {
			onEmpty?.();
			if (emptyBehavior === 'ignore') {
				// restore last numeric value on blur
				setDisplayValue(Number.isFinite(value) ? String(value) : '');
				return;
			}
			const fallback = typeof min === 'number' ? min : 0;
			const next = roundToOneDecimal(clamp(fallback, min, max));
			onChange(next);
			setDisplayValue(String(next));
		}
	};

	const numericForBounds = (() => {
		const parsed = Number(displayValue);
		return displayValue === '' || Number.isNaN(parsed) ? value : parsed;
	})();

	const atMin = typeof min === 'number' ? numericForBounds <= min : false;
	const atMax = typeof max === 'number' ? numericForBounds >= max : false;

	return (
		<div className={`${styles.container} ${containerClassName || ''}`}>
			<label className={styles.label} htmlFor={inputId}>
				{label}
				{required ? <span className={styles.required}>*</span> : null}
			</label>

			{helpText ? (
				<div id={`${inputId}-help`} className={styles.help}>
					{helpText}
				</div>
			) : null}

			<div className={`${styles.control} ${disabled ? styles.disabled : ''} ${errorMessage ? styles.error : ''}`}>
				<button type="button" className={styles.stepper} onClick={dec} disabled={disabled || atMin} aria-label={`Decrease ${label}`}>
					−
				</button>

				<div className={styles.inputWrap}>
					<input
						id={inputId}
						name={name}
						type="number"
						inputMode="numeric"
						className={`${styles.input} ${inputClassName || ''}`}
						value={displayValue}
						onChange={handleInputChange}
						onBlur={handleBlur}
						min={min}
						max={max}
						step={step}
						disabled={disabled}
						required={required}
						aria-invalid={errorMessage ? 'true' : 'false'}
						aria-describedby={describedById}
					/>
					{unit ? <span className={styles.unit}>{unit}</span> : null}
					{rightAddon ? <span className={styles.rightAddon}>{rightAddon}</span> : null}
				</div>

				<button type="button" className={styles.stepper} onClick={inc} disabled={disabled || atMax} aria-label={`Increase ${label}`}>
					+
				</button>
			</div>

			{errorMessage ? (
				<div id={`${inputId}-error`} className={styles.errorMessage}>
					{errorMessage}
				</div>
			) : null}
		</div>
	);
};
