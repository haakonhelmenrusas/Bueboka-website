'use client';

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Select.module.css';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';

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
	value: string | string[];
	onChange: (value: string | string[]) => void;
	placeholderLabel?: string;
	/** Text shown in the dropdown when there are no options. */
	emptyText?: string;
	helpText?: string;
	errorMessage?: string;
	disabled?: boolean;
	optional?: boolean;
	name?: string;
	id?: string;
	containerClassName?: string;
	labelClassName?: string;
	buttonClassName?: string;
	/** Enable multi-select behavior (toggle options, keep menu open). */
	multiple?: boolean;
	/** When multiple is true and more than this number is selected, show a count instead of joined labels. */
	maxSelectedLabels?: number;
	/** Enable search/filter functionality for options. Useful when there are many options. */
	searchable?: boolean;
	/** Placeholder text for the search input. */
	searchPlaceholder?: string;
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
	optional,
	name,
	id,
	containerClassName,
	labelClassName,
	buttonClassName,
	multiple = false,
	maxSelectedLabels = 2,
	searchable = false,
	searchPlaceholder = 'Søk...',
}) => {
	const autoId = useId();
	const selectId = id ?? `select-${autoId}`;
	const buttonId = `${selectId}-button`;
	const listboxId = `${selectId}-listbox`;
	const rootRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const searchInputRef = useRef<HTMLInputElement | null>(null);
	const menuRef = useRef<HTMLUListElement | null>(null);

	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number>(-1);
	const [searchQuery, setSearchQuery] = useState('');
	const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
	const describedById = useMemo(() => {
		const ids: string[] = [];
		if (helpText) ids.push(`${selectId}-help`);
		if (errorMessage) ids.push(`${selectId}-error`);
		return ids.length ? ids.join(' ') : undefined;
	}, [errorMessage, helpText, selectId]);

	const selectedValues = useMemo(() => {
		return multiple ? (Array.isArray(value) ? value : value ? [value] : []) : [];
	}, [multiple, value]);

	const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

	// Filter options based on search query
	const filteredOptions = useMemo(() => {
		if (!searchable || !searchQuery.trim()) return options;

		const query = searchQuery.toLowerCase();
		return options.filter((opt) => {
			const labelMatch = opt.label.toLowerCase().includes(query);
			const subtitleMatch = opt.subtitle?.toLowerCase().includes(query);
			return labelMatch || subtitleMatch;
		});
	}, [searchable, searchQuery, options]);

	const selectedOption = useMemo(() => {
		if (multiple) return undefined;
		return options.find((o) => o.value === value);
	}, [multiple, options, value]);

	const selectedOptions = useMemo(() => {
		if (!multiple) return [];
		return options.filter((o) => selectedSet.has(o.value));
	}, [multiple, options, selectedSet]);

	const hasEnabledOptions = filteredOptions.some((o) => !o.disabled);

	const openMenu = () => {
		if (disabled) return;

		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setMenuRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
		}

		setOpen(true);
		// set active to selected, otherwise first enabled
		if (multiple) {
			const firstEnabledIdx = filteredOptions.findIndex((o) => !o.disabled);
			setActiveIndex(firstEnabledIdx);
		} else {
			const selectedIdx = filteredOptions.findIndex((o) => o.value === value);
			const firstEnabledIdx = filteredOptions.findIndex((o) => !o.disabled);
			setActiveIndex(selectedIdx >= 0 ? selectedIdx : firstEnabledIdx);
		}

		// Focus search input after menu opens if searchable
		if (searchable) {
			setTimeout(() => searchInputRef.current?.focus(), 10);
		}
	};

	const closeMenu = () => {
		setOpen(false);
		setActiveIndex(-1);
		if (searchable) {
			setSearchQuery('');
		}
	};

	const toggleMenu = () => {
		if (open) closeMenu();
		else openMenu();
	};

	// Use custom hooks for better separation of concerns
	const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
		// Don't close if the click was inside the portaled menu
		if (menuRef.current && menuRef.current.contains(e.target as Node)) {
			return;
		}
		closeMenu();
	}, []);

	const handleEscapeKey = useCallback((e: KeyboardEvent) => {
		e.preventDefault();
		closeMenu();
		buttonRef.current?.focus();
	}, []);

	useClickOutside(rootRef, handleClickOutside, open);
	useEscapeKey(handleEscapeKey, open);

	const commitIndex = (idx: number) => {
		if (!hasEnabledOptions) return;
		const opt = filteredOptions[idx];
		if (!opt || opt.disabled) return;

		if (multiple) {
			const next = selectedSet.has(opt.value) ? selectedValues.filter((v) => v !== opt.value) : [...selectedValues, opt.value];
			onChange(next);
			// Keep menu open for multi-select.
			return;
		}

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
		for (let i = 0; i < filteredOptions.length; i++) {
			idx = (idx + dir + filteredOptions.length) % filteredOptions.length;
			if (!filteredOptions[idx].disabled) {
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

	const buttonText = useMemo(() => {
		if (!multiple) return selectedOption ? selectedOption.label : placeholderLabel || '';
		if (selectedOptions.length === 0) return placeholderLabel || '';
		if (selectedOptions.length > maxSelectedLabels) return `${selectedOptions.length} valgt`;
		return selectedOptions.map((o) => o.label).join(', ');
	}, [maxSelectedLabels, multiple, placeholderLabel, selectedOption, selectedOptions]);

	return (
		<div className={`${styles.container} ${containerClassName || ''}`} ref={rootRef}>
			<label htmlFor={buttonId} className={`${styles.label} ${labelClassName || ''}`}>
				{label}
				{optional ? <span className={styles.optional}> (valgfritt)</span> : null}
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
						{!multiple && selectedOption?.icon ? <span className={styles.optionIcon}>{selectedOption.icon}</span> : null}
						<span
							className={`${styles.valueText} ${(!buttonText && !Array.isArray(value) && !value) || (multiple && selectedOptions.length === 0) ? styles.placeholder : ''}`}
						>
							{buttonText}
						</span>
					</span>
				</button>

				{open && menuRect ? createPortal(
					<ul
						className={styles.menu}
						role="listbox"
						id={listboxId}
						ref={menuRef}
						aria-labelledby={buttonId}
						style={{ position: 'fixed', top: menuRect.top, left: menuRect.left, width: menuRect.width }}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{searchable ? (
							<li className={styles.searchWrapper}>
								<input
									ref={searchInputRef}
									type="text"
									className={styles.searchInput}
									placeholder={searchPlaceholder}
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setActiveIndex(0); // Reset to first option when searching
									}}
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => {
										if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
											e.preventDefault();
											moveActive(e.key === 'ArrowDown' ? 1 : -1);
										} else if (e.key === 'Enter' && activeIndex >= 0) {
											e.preventDefault();
											commitIndex(activeIndex);
										} else if (e.key === 'Escape') {
											e.preventDefault();
											closeMenu();
											buttonRef.current?.focus();
										}
									}}
								/>
							</li>
						) : null}
						{filteredOptions.length === 0 || !hasEnabledOptions ? (
							<li className={`${styles.option} ${styles.optionEmpty}`} role="option" aria-disabled="true">
								<span className={styles.optionLabel}>{searchQuery ? 'Ingen treff' : emptyText}</span>
							</li>
						) : (
							filteredOptions.map((opt, idx) => {
								const selected = multiple ? selectedSet.has(opt.value) : opt.value === value;
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
					</ul>,
					document.body
				) : null}
			</div>

			{/* hidden input for native form posts */}
			{name ? (
				multiple ? (
					selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)
				) : (
					<input type="hidden" name={name} value={typeof value === 'string' ? value : ''} />
				)
			) : null}

			{errorMessage ? (
				<div id={`${selectId}-error`} className={styles.errorMessage}>
					{errorMessage}
				</div>
			) : null}
		</div>
	);
};
