import { buildEmailHtml } from './base';
import type { EmailLocale } from './locale';

type VerifyEmailOptions = {
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
    subject: 'Bekreft e-postadressen din - Bueboka',
    heading: 'Velkommen til Bueboka!',
    greeting: (name: string) => `Hei ${name}!`,
    body: 'Takk for at du opprettet en konto hos Bueboka. For å komme i gang, vennligst bekreft e-postadressen din ved å klikke på knappen nedenfor:',
    buttonText: 'Bekreft e-postadresse',
    fallbackLinkLabel: 'Eller kopier og lim inn denne lenken i nettleseren din:',
    footerNote: 'Hvis du ikke opprettet en konto hos Bueboka, kan du trygt ignorere denne e-posten.',
    expiryNote: 'Denne lenken utløper om 24 timer.',
    brandTagline: 'Din digitale bueskytter-treningsdagbok.',
    text: (name: string, url: string) =>
      `Velkommen til Bueboka!\n\nHei ${name}!\n\nBekreft e-postadressen din ved å klikke på lenken:\n${url}\n\nHvis du ikke opprettet en konto hos oss, kan du ignorere denne e-posten.\n\nMed vennlig hilsen,\nBueboka`,
  },
  en: {
    subject: 'Verify your email address - Bueboka',
    heading: 'Welcome to Bueboka!',
    greeting: (name: string) => `Hi ${name}!`,
    body: 'Thank you for creating an account with Bueboka. To get started, please verify your email address by clicking the button below:',
    buttonText: 'Verify email address',
    fallbackLinkLabel: 'Or copy and paste this link into your browser:',
    footerNote: "If you didn't create a Bueboka account, you can safely ignore this email.",
    expiryNote: 'This link expires in 24 hours.',
    brandTagline: 'Your digital archery training log.',
    text: (name: string, url: string) =>
      `Welcome to Bueboka!\n\nHi ${name}!\n\nVerify your email address by clicking the link:\n${url}\n\nIf you didn't create an account with us, you can safely ignore this email.\n\nBest regards,\nBueboka`,
  },
} as const;

export function verifyEmailEmail(opts: VerifyEmailOptions): EmailContent {
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
