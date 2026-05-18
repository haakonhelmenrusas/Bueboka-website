type EmailLayoutOptions = {
  lang: string;
  baseUrl: string;
  heading: string;
  greeting: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  fallbackLinkLabel: string;
  footerNote: string;
  expiryNote: string;
  brandTagline: string;
};

export function buildEmailHtml(opts: EmailLayoutOptions): string {
  const {
    lang,
    baseUrl,
    heading,
    greeting,
    body,
    buttonText,
    buttonUrl,
    fallbackLinkLabel,
    footerNote,
    expiryNote,
    brandTagline,
  } = opts;

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); padding: 40px; text-align: center;">
              <img src="${baseUrl}/assets/logo.png" alt="Bueboka" style="max-width: 120px; height: auto; margin-bottom: 20px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">${heading}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">${greeting}</p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">${body}</p>
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #053546 0%, #0c82ac 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(5, 53, 70, 0.3);">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">${fallbackLinkLabel}</p>
              <p style="color: #0c82ac; font-size: 14px; line-height: 1.6; margin: 10px 0 0; word-break: break-all;">${buttonUrl}</p>
            </td>
          </tr>
          <!-- Footer note -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">${footerNote}</p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">${expiryNote}</p>
            </td>
          </tr>
          <!-- Brand footer -->
          <tr>
            <td style="background-color: #053546; padding: 20px; text-align: center;">
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0;">
                © ${year} Bueboka. ${brandTagline}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
