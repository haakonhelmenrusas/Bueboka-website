import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { rating, feedback } = body;

		// Validate input
		if (!rating || rating < 1 || rating > 5) {
			return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
		}

		if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
			return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
		}

		// Generate star rating display
		const stars = '⭐'.repeat(rating);

		// Create email content
		const emailHtml = `
			<!DOCTYPE html>
			<html lang="no">
				<head>
					<meta charset="utf-8">
					<style>
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
							line-height: 1.6;
							color: #333;
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
						}
						.header {
							background: linear-gradient(135deg, #053546 0%, #0c82ac 100%);
							color: white;
							padding: 30px;
							border-radius: 8px 8px 0 0;
							text-align: center;
						}
						.logo {
							max-width: 150px;
							margin-bottom: 15px;
						}
						.content {
							background: #f9fafb;
							padding: 30px;
							border-radius: 0 0 8px 8px;
						}
						.rating {
							font-size: 32px;
							text-align: center;
							margin: 20px 0;
						}
						.info-box {
							background: white;
							padding: 15px;
							border-radius: 6px;
							margin: 15px 0;
							border-left: 4px solid #0c82ac;
						}
						.info-label {
							font-weight: 600;
							color: #053546;
							margin-bottom: 5px;
						}
						.feedback-text {
							background: white;
							padding: 20px;
							border-radius: 6px;
							margin: 20px 0;
							border: 1px solid #e5e7eb;
							white-space: pre-wrap;
							word-wrap: break-word;
						}
						.footer {
							text-align: center;
							margin-top: 30px;
							color: #6b7280;
							font-size: 14px;
						}
					</style>
				</head>
				<body>
					<div class="header">
						<h1 style="margin: 0; font-size: 24px;">Ny tilbakemelding fra Bueboka</h1>
					</div>
					<div class="content">
						<div class="rating">${stars}</div>
						
						<div class="info-box">
							<div class="info-label">Fra bruker:</div>
							<div>${user.name || 'Ukjent navn'}</div>
						</div>

						<div class="info-box">
							<div class="info-label">E-post:</div>
							<div>${user.email}</div>
						</div>

						<div class="info-box">
							<div class="info-label">Vurdering:</div>
							<div>${rating} av 5 stjerner</div>
						</div>

						<div class="info-label" style="margin-top: 20px; margin-bottom: 10px;">Tilbakemelding:</div>
						<div class="feedback-text">${feedback.trim()}</div>

						<div class="footer">
							<p>Mottatt ${new Date().toLocaleString('nb-NO', {
								dateStyle: 'long',
								timeStyle: 'short',
							})}</p>
						</div>
					</div>
				</body>
			</html>
		`;

		const emailText = `
Ny tilbakemelding fra Bueboka

Vurdering: ${rating} av 5 stjerner (${stars})

Fra: ${user.name || 'Ukjent navn'}
E-post: ${user.email}

Tilbakemelding:
${feedback.trim()}

Mottatt: ${new Date().toLocaleString('nb-NO')}
		`;

		// Send email
		await sendEmail({
			to: 'haakon.rusas@pm.me',
			subject: `Tilbakemelding fra ${user.name || user.email} - ${stars}`,
			html: emailHtml,
			text: emailText,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error sending feedback:', error);
		return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
	}
}
