// jest.setup.js
import '@testing-library/jest-dom';

// Node/JSDOM polyfills needed by some deps (Prisma runtime / cuid2 / etc.)
import { TextDecoder, TextEncoder } from 'util';

if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
	global.TextDecoder = TextDecoder;
}

// Avoid importing better-auth ESM client during tests
jest.mock('@/lib/auth-client', () => require('./__mocks__/auth-client'));
