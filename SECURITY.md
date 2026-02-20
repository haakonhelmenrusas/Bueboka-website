# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

The Bueboka team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **security@bueboka.no**

If you prefer encrypted communication, you can use our GPG key (available upon request).

### What to Include

To help us better understand the nature and scope of the issue, please include as much of the following information as possible:

- Type of issue (e.g., SQL injection, XSS, authentication bypass, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response:** We will acknowledge your email within 48 hours
- **Status Update:** We will provide a detailed response within 7 days
- **Fix Timeline:** Critical issues will be patched within 30 days
- **Disclosure:** We follow coordinated disclosure and will credit you in our release notes (unless you prefer to remain anonymous)

### Scope

The following are in scope for our bug bounty program:

- Authentication and authorization bypasses
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Remote code execution
- Information disclosure
- Session hijacking

### Out of Scope

The following are explicitly out of scope:

- Denial of service attacks
- Social engineering attacks
- Physical attacks
- Reports from automated tools without validation
- Issues in third-party dependencies (report to the maintainer directly)
- Issues affecting outdated browsers
- Self-XSS
- Clickjacking on pages without sensitive actions

## Security Best Practices

When contributing to Bueboka, please:

1. **Never commit secrets** - Use environment variables for all sensitive data
2. **Validate all input** - Assume all user input is malicious
3. **Use Prisma ORM** - Prevents SQL injection
4. **Enable CSP** - Content Security Policy headers
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Use HTTPS** - Always use secure connections
7. **Implement rate limiting** - Prevent abuse
8. **Follow OWASP guidelines** - https://owasp.org/

## Security Features

Bueboka implements the following security measures:

- ✅ Industry-standard authentication (Better Auth)
- ✅ Password hashing with bcrypt
- ✅ Session management with secure cookies
- ✅ SQL injection protection (Prisma ORM)
- ✅ Rate limiting on authentication endpoints
- ✅ Email verification for new accounts
- ✅ CSRF protection
- ✅ Secure password reset flow
- ✅ Input validation on all API endpoints

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible

## Recognition

We maintain a list of security researchers who have responsibly disclosed vulnerabilities:

- Hall of Fame coming soon!

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request or contact us at security@bueboka.no.

---

**Last Updated:** February 19, 2026

