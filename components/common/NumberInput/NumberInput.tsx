'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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
	optional?: boolean;
	helpText?: React.ReactNode;
	errorMessage?: string;
	/** Optional unit label, e.g. "m", "kg". */
	unit?: string;
	/**
	 * How to treat empty input on blur. Defaults to "clamp" (fills in min or 0).
	 * Use "ignore" to restore the last numeric value instead.
	 */
	emptyBehavior?: 'clamp' | 'ignore';
	/** If true, the input starts visually empty when the initial value is 0. */
	startEmpty?: boolean;
	name?: string;
	id?: string;
	containerClassName?: string;
	inputClassName?: string;
	rightAddon?: React.ReactNode;
	/** Called when the input is cleared. Useful for nullable numeric fields — the
	 *  field will stay empty rather than filling in min/0. */
	onEmpty?: () => void;
	width?: string | number;
}

// --- Pure helpers -----------------------------------------------------------

const clamp = (n: number, min?: number, max?: number) => {
	let v = n;
	if (typeof min === 'number') v = Math.max(min, v);
	if (typeof max === 'number') v = Math.min(max, v);
	return v;
};

const roundToStep = (n: number, step: number): number => {
	const stepStr = step.toString();
	const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
	const multiplier = Math.pow(10, decimals);
	return Math.round(n * multiplier) / multiplier;
};

const toDisplay = (value: number) => (Number.isFinite(value) ? String(value) : '');

const initialDisplay = (value: number, startEmpty: boolean) =>
	startEmpty && value === 0 ? '' : toDisplay(value);

// ----------------------------------------------------------------------------

export const NumberInput: React.FC<NumberInputProps> = ({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	disabled,
	required,
	optional,
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
	width,
}) => {
	const autoId = useId();
	const inputId = id ?? `number-input-${autoId}`;
	const inputRef = useRef<HTMLInputElement>(null);

	const describedById = useMemo(() => {
		const ids: string[] = [];
		if (helpText) ids.push(`${inputId}-help`);
		if (errorMessage) ids.push(`${inputId}-error`);
		return ids.length ? ids.join(' ') : undefined;
	}, [errorMessage, helpText, inputId]);

	// The display string is the local source of truth for the input element.
	const [displayValue, setDisplayValue] = useState(() => initialDisplay(value, startEmpty));

	// Track the previous external value so we only sync in genuine parent-driven changes.
	const prevValueRef = useRef(value);

	useEffect(() => {
		const prev = prevValueRef.current;
		prevValueRef.current = value;

		// Same value as before — nothing to sync (avoids overwriting an empty field
		// e.g. when onEmpty sets the parent to null which renders as 0 via ?? 0).
		if (value === prev) return;

		setDisplayValue(toDisplay(value));
	}, [value]);


	// --- Input handlers -----------------------------------------------------

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		// Normalize comma → dot so both decimal separators are accepted
		const raw = e.target.value.replace(',', '.');
		setDisplayValue(raw);

		if (raw === '') {
			if (onEmpty) {
				onEmpty();
			} else if (emptyBehavior === 'clamp') {
				onChange(clamp(typeof min === 'number' ? min : 0, min, max));
			}
			return;
		}

		// Allow intermediate states like "3." or "-" while the user is still typing
		if (raw === '-' || raw.endsWith('.')) return;

		const parsed = Number(raw);
		if (Number.isNaN(parsed)) return;
		const next = roundToStep(clamp(parsed, min, max), step);
		onChange(next);
		if (next !== parsed) setDisplayValue(String(next));
	};

	const handleBlur = () => {
		if (disabled || displayValue !== '') return;

		if (onEmpty) {
			// Nullable field — keep it empty.
			onEmpty();
		} else if (emptyBehavior === 'ignore') {
			// Restore last committed value.
			setDisplayValue(toDisplay(value));
		} else {
			// clamp: fill in the minimum (or 0).
			const next = roundToStep(clamp(typeof min === 'number' ? min : 0, min, max), step);
			onChange(next);
			setDisplayValue(String(next));
		}
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (disabled) return;
		if (displayValue === '0' || (startEmpty && value === 0)) {
			setDisplayValue('');
			e.target.select();
		}
	};

	// --- Derived display state ----------------------------------------------

	const numericDisplay = (() => {
		const parsed = Number(displayValue);
		return displayValue === '' || Number.isNaN(parsed) ? value : parsed;
	})();

	const widthStyle = width != null ? (typeof width === 'number' ? `${width}px` : width) : undefined;

	// --- Unit label offset (measures text width) ----------------------------

	const [unitOffset, setUnitOffset] = useState(0);

	useEffect(() => {
		if (!unit || !inputRef.current) return;
		const span = document.createElement('span');
		span.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap';
		span.style.font = window.getComputedStyle(inputRef.current).font;
		span.textContent = displayValue || '0';
		document.body.appendChild(span);
		setUnitOffset(span.offsetWidth / 2 + 8);
		document.body.removeChild(span);
	}, [displayValue, unit]);

	// ------------------------------------------------------------------------

	return (
		<div className={`${styles.container} ${containerClassName || ''}`} style={widthStyle ? { width: widthStyle } : undefined}>
			<label className={styles.label} htmlFor={inputId}>
				{label}
				{required && <span className={styles.required}>*</span>}
				{optional && <span className={styles.optional}>(valgfritt)</span>}
			</label>

			{helpText && (
				<div id={`${inputId}-help`} className={styles.help}>
					{helpText}
				</div>
			)}

			<div className={`${styles.control} ${disabled ? styles.disabled : ''} ${errorMessage ? styles.error : ''}`}>
				<div className={styles.inputWrap} onClick={() => inputRef.current?.focus()}>
					<input
						ref={inputRef}
						id={inputId}
						name={name}
						type="text"
						inputMode="decimal"
						role="spinbutton"
						aria-valuemin={min}
						aria-valuemax={max}
						aria-valuenow={numericDisplay}
						className={`${styles.input} ${inputClassName || ''}`}
						value={displayValue}
						onChange={handleChange}
						onBlur={handleBlur}
						onFocus={handleFocus}
						disabled={disabled}
						required={required}
						aria-invalid={errorMessage ? 'true' : 'false'}
						aria-describedby={describedById}
					/>
					{unit && <span className={styles.unit} style={{ transform: `translateX(${unitOffset}px)` }}>{unit}</span>}
					{rightAddon && <span className={styles.rightAddon}>{rightAddon}</span>}
				</div>
			</div>

			{errorMessage && (
				<div id={`${inputId}-error`} className={styles.errorMessage}>
					{errorMessage}
				</div>
			)}
		</div>
	);
};
