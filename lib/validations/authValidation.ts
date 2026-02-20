/**
 * Authentication form validation utilities
 * Provides reusable validation functions for login and signup forms
 */

export interface EmailPasswordErrors {
	email?: string;
	password?: string;
}

export interface SignUpErrors extends EmailPasswordErrors {
	name?: string;
}

/**
 * Validates email field
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateEmail(email: string | null | undefined): string | undefined {
	if (!email || email.trim() === '') {
		return 'E-post mangler';
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return 'Ugyldig e-postadresse';
	}

	return undefined;
}

/**
 * Validates password field
 * @param password - Password to validate
 * @param minLength - Minimum required length (default: 8)
 * @returns Error message if invalid, undefined if valid
 */
export function validatePassword(password: string | null | undefined, minLength: number = 8): string | undefined {
	if (!password || password.trim() === '') {
		return 'Passord mangler';
	}

	if (password.length < minLength) {
		return `Passord må være minst ${minLength} tegn`;
	}

	return undefined;
}

/**
 * Validates name field
 * @param name - Name to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateName(name: string | null | undefined): string | undefined {
	if (!name || name.trim() === '') {
		return 'Navn mangler';
	}

	return undefined;
}

/**
 * Validates login form data
 * @param email - Email address
 * @param password - Password
 * @returns Object with field errors, empty if all valid
 */
export function validateLoginForm(email: string | null | undefined, password: string | null | undefined): EmailPasswordErrors {
	const errors: EmailPasswordErrors = {};

	const emailError = validateEmail(email);
	if (emailError) errors.email = emailError;

	const passwordError = validatePassword(password, 1); // Login doesn't enforce min length
	if (passwordError) errors.password = passwordError;

	return errors;
}

/**
 * Validates signup form data
 * @param name - User's name
 * @param email - Email address
 * @param password - Password
 * @returns Object with field errors, empty if all valid
 */
export function validateSignUpForm(
	name: string | null | undefined,
	email: string | null | undefined,
	password: string | null | undefined
): SignUpErrors {
	const errors: SignUpErrors = {};

	const nameError = validateName(name);
	if (nameError) errors.name = nameError;

	const emailError = validateEmail(email);
	if (emailError) errors.email = emailError;

	const passwordError = validatePassword(password, 8); // Signup requires 8 chars
	if (passwordError) errors.password = passwordError;

	return errors;
}
