'use client';

import { Footer, Header } from '@/components';
import { Accordion, type AccordionItem } from '@/components/common/Accordion/Accordion';
import { useTranslation } from '@/context/LanguageProvider';
import {
	LuArrowRight,
	LuCircleHelp,
	LuListChecks,
	LuMousePointerClick,
	LuTarget,
} from 'react-icons/lu';
import styles from './page.module.css';

export default function FaqPage() {
	const { t } = useTranslation();

	const items: AccordionItem[] = [
		{
			id: 'what-is',
			title: t['faq.q1.title'],
			icon: <LuCircleHelp size={22} />,
			content: <p>{t['faq.a1.body']}</p>,
		},
		{
			id: 'add-bow',
			title: t['faq.q2.title'],
			icon: <LuTarget size={22} />,
			content: <p>{t['faq.a2.body']}</p>,
		},
		{
			id: 'add-arrows',
			title: t['faq.q3.title'],
			icon: <LuArrowRight size={22} />,
			content: <p>{t['faq.a3.body']}</p>,
		},
		{
			id: 'practice-no-scoring',
			title: t['faq.q4.title'],
			icon: <LuMousePointerClick size={22} />,
			content: <p>{t['faq.a4.body']}</p>,
		},
		{
			id: 'practice-scoring',
			title: t['faq.q5.title'],
			icon: <LuListChecks size={22} />,
			content: <p>{t['faq.a5.body']}</p>,
		},
	];

	return (
		<>
			<Header />
			<main className={styles.container}>
				<div className={styles.heading}>
					<h1>{t['faq.title']}</h1>
					<p className={styles.subtitle}>{t['faq.subtitle']}</p>
				</div>
				<Accordion items={items} defaultOpenId="what-is" className={styles.accordionLg} />
			</main>
			<Footer />
		</>
	);
}
