'use client';

import React, { useState } from 'react';
import { LuSend } from 'react-icons/lu';
import styles from './ContactForm.module.css';
import { Button, Input, TextArea } from '@/components';
import { useTranslation } from '@/context/LanguageProvider';

export function ContactForm() {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		content: '',
	});
	const [botField, setBotField] = useState(''); // Netlify honeypot
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('submitting');

		try {
			const body = new URLSearchParams({
				'form-name': 'contact',
				name: formData.name,
				email: formData.email,
				content: formData.content,
				'bot-field': botField,
			}).toString();

			const res = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
			});

			if (!res.ok) throw new Error('Network response was not ok');

			setStatus('success');
			setFormData({ name: '', email: '', content: '' });
			setBotField('');
		} catch (err) {
			setStatus('error');
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return (
		<div className={styles.card}>
			<h3 className={styles.heading}>{t['contact.heading']}</h3>

			<form
				onSubmit={handleSubmit}
				className={styles.form}
				name="contact"
				method="POST"
				data-netlify="true"
				data-netlify-honeypot="bot-field"
			>
				<input type="hidden" name="form-name" value="contact" />

				<p className={styles.honeypot}>
					<label>
						{t['contact.honeypotLabel']}
						<input name="bot-field" value={botField} onChange={(e) => setBotField(e.target.value)} autoComplete="off" tabIndex={-1} />
					</label>
				</p>

				<Input label={t['contact.nameLabel']} id="name" name="name" value={formData.name} onChange={handleChange} required placeholder={t['contact.namePlaceholder']} />

				<Input
					label={t['contact.emailLabel']}
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
					placeholder={t['contact.emailPlaceholder']}
				/>

				<TextArea
					label={t['contact.messageLabel']}
					id="content"
					name="content"
					value={formData.content}
					onChange={handleChange}
					required
					rows={4}
					placeholder={t['contact.messagePlaceholder']}
				/>

				<Button
					type="submit"
					label={status === 'submitting' ? t['contact.sending'] : t['contact.sendButton']}
					icon={<LuSend size={16} />}
					loading={status === 'submitting'}
				/>

				<div className={styles.status} aria-live="polite" role="status">
					{status === 'success' && t['contact.success']}
					{status === 'error' && t['contact.error']}
				</div>
			</form>
		</div>
	);
}
