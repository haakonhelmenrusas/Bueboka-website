'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './Select.module.css';

export type SelectOption = {
	value: string;
	label: string;
	subtitle?: string;
	disabled?: boolean;
	icon?: React.ReactNode;
};

export interface SelectProps {
	label: string;
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholderLabel?: string;
	/** Text shown in the dropdown when there are no options. */
	emptyText?: string;
	helpText?: string;
	errorMessage?: string;
	disabled?: boolean;
	name?: string;
	id?: string;
	containerClassName?: string;
	labelClassName?: string;
	buttonClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
	label,
	options,
	value,
	onChange,
	placeholderLabel,
	emptyText = 'Ingen valg tilgjengelig',
	helpText,
	errorMessage,
	disabled,
	name,
	id,
	containerClassName,
	labelClassName,
	buttonClassName,
}) => {
	const autoId = useId();
	const selectId = id ?? `select-${autoId}`;
	const buttonId = `${selectId}-button`;
	const listboxId = `${selectId}-listbox`;
	const rootRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);

	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number>(-1);

	const describedById = useMemo(() => {
		const ids: string[] = [];
		if (helpText) ids.push(`${selectId}-help`);
		if (errorMessage) ids.push(`${selectId}-error`);
		return ids.length ? ids.join(' ') : undefined;
	}, [errorMessage, helpText, selectId]);

	const selectedOption = options.find((o) => o.value === value);

	const hasEnabledOptions = options.some((o) => !o.disabled);

	const openMenu = () => {
		if (disabled) return;
		setOpen(true);
		// set active to selected, otherwise first enabled
		const selectedIdx = options.findIndex((o) => o.value === value);
		const firstEnabledIdx = options.findIndex((o) => !o.disabled);
		setActiveIndex(selectedIdx >= 0 ? selectedIdx : firstEnabledIdx);
	};

	const closeMenu = () => {
		setOpen(false);
		setActiveIndex(-1);
	};

	const toggleMenu = () => {
		if (open) closeMenu();
		else openMenu();
	};

	useEffect(() => {
		if (!open) return;
		const onDocMouseDown = (e: MouseEvent) => {
			const el = rootRef.current;
			if (!el) return;
			if (e.target instanceof Node && !el.contains(e.target)) {
				closeMenu();
			}
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeMenu();
				buttonRef.current?.focus();
			}
		};
		document.addEventListener('mousedown', onDocMouseDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	const commitIndex = (idx: number) => {
		if (!hasEnabledOptions) return;
		const opt = options[idx];
		if (!opt || opt.disabled) return;
		onChange(opt.value);
		closeMenu();
		buttonRef.current?.focus();
	};

	const moveActive = (dir: 1 | -1) => {
		if (!open) {
			openMenu();
			return;
		}
		let idx = activeIndex;
		for (let i = 0; i < options.length; i++) {
			idx = (idx + dir + options.length) % options.length;
			if (!options[idx].disabled) {
				setActiveIndex(idx);
				return;
			}
		}
	};

	const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) return;
		switch (e.key) {
			case 'ArrowDown':
			case 'Down':
				e.preventDefault();
				moveActive(1);
				break;
			case 'ArrowUp':
			case 'Up':
				e.preventDefault();
				moveActive(-1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (!open) openMenu();
				else if (activeIndex >= 0) commitIndex(activeIndex);
				break;
			default:
				break;
		}
	};

	return (
		<div className={`${styles.container} ${containerClassName || ''}`} ref={rootRef}>
			<label htmlFor={buttonId} className={`${styles.label} ${labelClassName || ''}`}>
				{label}
			</label>

			{helpText ? (
				<div id={`${selectId}-help`} className={styles.help}>
					{helpText}
				</div>
			) : null}

			<div className={`${styles.control} ${errorMessage ? styles.error : ''} ${disabled ? styles.disabled : ''}`}>
				<button
					ref={buttonRef}
					id={buttonId}
					type="button"
					className={`${styles.button} ${buttonClassName || ''}`}
					onClick={toggleMenu}
					onKeyDown={onButtonKeyDown}
					disabled={disabled}
					aria-label={label}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={listboxId}
					aria-invalid={errorMessage ? 'true' : 'false'}
					aria-describedby={describedById}
				>
					<span className={styles.valueRow}>
						{selectedOption?.icon ? <span className={styles.optionIcon}>{selectedOption.icon}</span> : null}
						<span className={`${styles.valueText} ${!selectedOption && !value ? styles.placeholder : ''}`}>
							{selectedOption ? selectedOption.label : placeholderLabel || ''}
						</span>
					</span>
				</button>

				{open ? (
					<ul className={styles.menu} role="listbox" id={listboxId} aria-labelledby={buttonId}>
						{options.length === 0 || !hasEnabledOptions ? (
							<li className={`${styles.option} ${styles.optionEmpty}`} role="option" aria-disabled="true">
								<span className={styles.optionLabel}>{emptyText}</span>
							</li>
						) : (
							options.map((opt, idx) => {
								const selected = opt.value === value;
								const active = idx === activeIndex;
								return (
									<li
										key={opt.value}
										role="option"
										aria-selected={selected}
										className={`${styles.option} ${selected ? styles.optionSelected : ''} ${active ? styles.optionActive : ''} ${opt.disabled ? styles.optionDisabled : ''}`}
										onMouseEnter={() => setActiveIndex(idx)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => commitIndex(idx)}
									>
										{opt.icon ? <span className={styles.optionIcon}>{opt.icon}</span> : null}
										<span className={styles.optionText}>
											<span className={styles.optionLabel}>{opt.label}</span>
											{opt.subtitle ? <span className={styles.optionSubtitle}>{opt.subtitle}</span> : null}
										</span>
									</li>
								);
							})
						)}
					</ul>
				) : null}
			</div>

			{/* hidden input for native form posts */}
			{name ? <input type="hidden" name={name} value={value} /> : null}

			{errorMessage ? (
				<div id={`${selectId}-error`} className={styles.errorMessage}>
					{errorMessage}
				</div>
			) : null}
		</div>
	);
};
