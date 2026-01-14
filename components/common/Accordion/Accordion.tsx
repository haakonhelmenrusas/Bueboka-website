'use client';

import React, { useState } from 'react';
import styles from './Accordion.module.css';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
	id: string;
	title: string;
	content: React.ReactNode;
	icon?: React.ReactNode;
}

interface AccordionProps {
	items: AccordionItem[];
	defaultOpenId?: string;
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
	const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

	return (
		<div className={styles.accordion}>
			{items.map((item) => {
				const isOpen = openId === item.id;
				return (
					<div key={item.id} className={styles.item}>
						<button
							id={`accordion-${item.id}-header`}
							className={styles.header}
							aria-expanded={isOpen}
							aria-controls={`accordion-${item.id}-panel`}
							onClick={() => setOpenId(isOpen ? null : item.id)}
						>
							<span className={styles.titleRow}>
								{item.icon && <span className={styles.titleIcon}>{item.icon}</span>}
								<span className={styles.title}>{item.title}</span>
							</span>
							<ChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} size={18} />
						</button>
						<div
							id={`accordion-${item.id}-panel`}
							role="region"
							aria-labelledby={`accordion-${item.id}-header`}
							className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
						>
							{isOpen ? item.content : null}
						</div>
					</div>
				);
			})}
		</div>
	);
}
