import { buildEmailHtml } from './base';
import type { EmailLocale } from './locale';

type ResetPasswordEmailOptions = {
  name: string;
  url: string;
  locale: EmailLocale;
  baseUrl: string;
};

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

const copy = {
  no: {
    subject: 'Tilbakestill passord - Bueboka',
    heading: 'Tilbakestill passord',
    greeting: (name: string) => `Hei ${name}!`,
    body: 'Du ba om å tilbakestille passordet ditt for Bueboka-kontoen din. Klikk på knappen nedenfor for å velge et nytt passord:',
    buttonText: 'Velg nytt passord',
    fallbackLinkLabel: 'Eller kopier og lim inn denne lenken i nettleseren din:',
    footerNote:
      'Hvis du ikke ba om å tilbakestille passordet, kan du trygt ignorere denne e-posten. Passordet ditt vil ikke bli endret.',
    expiryNote: 'Denne lenken utløper om 30 minutter av sikkerhetsgrunner.',
    brandTagline: 'Din digitale bueskytter-treningsdagbok.',
    text: (name: string, url: string) =>
      `Tilbakestill passord for Bueboka\n\nHei ${name}!\n\nDu ba om å tilbakestille passordet ditt. Klikk på lenken for å velge et nytt passord:\n${url}\n\nHvis du ikke ba om dette, kan du ignorere denne e-posten.\nLenken utløper om 30 minutter.\n\nMed vennlig hilsen,\nBueboka`,
  },
  en: {
    subject: 'Reset your password - Bueboka',
    heading: 'Reset your password',
    greeting: (name: string) => `Hi ${name}!`,
    body: 'You requested a password reset for your Bueboka account. Click the button below to choose a new password:',
    buttonText: 'Choose new password',
    fallbackLinkLabel: 'Or copy and paste this link into your browser:',
    footerNote:
      "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.",
    expiryNote: 'This link expires in 30 minutes for security reasons.',
    brandTagline: 'Your digital archery training log.',
    text: (name: string, url: string) =>
      `Reset your password for Bueboka\n\nHi ${name}!\n\nYou requested a password reset. Click the link to choose a new password:\n${url}\n\nIf you didn't request this, you can safely ignore this email.\nThe link expires in 30 minutes.\n\nBest regards,\nBueboka`,
  },
} as const;

export function resetPasswordEmail(opts: ResetPasswordEmailOptions): EmailContent {
  const { name, url, locale, baseUrl } = opts;
  const c = copy[locale];

  return {
    subject: c.subject,
    html: buildEmailHtml({
      lang: locale === 'en' ? 'en' : 'nb',
      baseUrl,
      heading: c.heading,
      greeting: c.greeting(name),
      body: c.body,
      buttonText: c.buttonText,
      buttonUrl: url,
      fallbackLinkLabel: c.fallbackLinkLabel,
      footerNote: c.footerNote,
      expiryNote: c.expiryNote,
      brandTagline: c.brandTagline,
    }),
    text: c.text(name, url),
  };
}
