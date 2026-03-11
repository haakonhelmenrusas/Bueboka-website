'use client';

import React, { useState } from 'react';
import { LuSend } from 'react-icons/lu';
import styles from './ContactForm.module.css';
import { Button, Input, TextArea } from '@/components';

export function ContactForm() {
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
				'form-name': 'contact', // must match the form name below
				name: formData.name,
				email: formData.email,
				content: formData.content,
				'bot-field': botField, // honeypot value
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
			<h3 className={styles.heading}>Kontakt oss</h3>

			{/* Netlify Forms: name, method, data-netlify, honeypot, hidden form-name input */}
			<form
				onSubmit={handleSubmit}
				className={styles.form}
				name="contact"
				method="POST"
				data-netlify="true"
				data-netlify-honeypot="bot-field"
			>
				<input type="hidden" name="form-name" value="contact" />

				{/* Honeypot field (should remain hidden) */}
				<p className={styles.honeypot}>
					<label>
						Ikke fyll ut dette feltet hvis du er et menneske:
						<input name="bot-field" value={botField} onChange={(e) => setBotField(e.target.value)} autoComplete="off" tabIndex={-1} />
					</label>
				</p>

				<Input label="Navn" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ditt navn" />

				<Input
					label="E-post"
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
					placeholder="din@email.no"
				/>

				<TextArea
					label="Melding"
					id="content"
					name="content"
					value={formData.content}
					onChange={handleChange}
					required
					rows={4}
					placeholder="Skriv din melding her..."
				/>

				<Button
					type="submit"
					label={status === 'submitting' ? 'Sender…' : 'Send melding'}
					icon={<LuSend size={16} />}
					loading={status === 'submitting'}
				/>

				<div className={styles.status} aria-live="polite" role="status">
					{status === 'success' && 'Takk! Meldingen er sendt.'}
					{status === 'error' && 'Noe gikk galt. Prøv igjen senere.'}
				</div>
			</form>
		</div>
	);
}
