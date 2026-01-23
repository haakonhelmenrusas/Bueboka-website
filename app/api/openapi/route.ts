import { NextResponse } from 'next/server';

const spec = {
	openapi: '3.0.3',
	info: {
		title: 'Bueboka API',
		version: '1.0.0',
		description: 'Public API documentation for Bueboka-web',
	},
	servers: [{ url: '/' }],
	paths: {
		// Auth (better-auth catch-all)
		'/api/auth/{all}': {
			parameters: [{ name: 'all', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Auth handler (GET)', responses: { '200': { description: 'OK' } } },
			post: { summary: 'Auth handler (POST)', responses: { '200': { description: 'OK' } } },
		},

		// Profile
		'/api/profile': {
			get: {
				summary: 'Get current user profile',
				description: 'Returns basic profile info for the authenticated user.',
				responses: { '200': { description: 'Profile payload' }, '401': { description: 'Unauthorized' } },
			},
		},

		// Register
		'/api/register': {
			post: {
				summary: 'Register new user',
				description: 'Creates a new user account.',
				responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } },
			},
		},

		// Users
		'/api/users': {
			get: { summary: 'List users', responses: { '200': { description: 'Array of users' } } },
			post: { summary: 'Create user', responses: { '201': { description: 'Created' } } },
		},
		'/api/users/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Get user by id', responses: { '200': { description: 'User' }, '404': { description: 'Not found' } } },
			patch: { summary: 'Update user', responses: { '200': { description: 'Updated' } } },
			delete: { summary: 'Delete user', responses: { '204': { description: 'Deleted' } } },
		},
		'/api/users/delete': {
			delete: { summary: 'Delete current user', responses: { '204': { description: 'Deleted' }, '401': { description: 'Unauthorized' } } },
		},

		// Practices
		'/api/practices': {
			get: {
				summary: 'List practices',
				parameters: [
					{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
					{ name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
				],
				responses: { '200': { description: 'List of practices' } },
			},
			post: {
				summary: 'Create practice',
				responses: {
					'201': { description: 'Created' },
					'400': { description: 'Validation error' },
					'401': { description: 'Unauthorized' },
				},
			},
		},
		'/api/practices/cards': {
			get: {
				summary: 'List practice cards',
				parameters: [
					{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
					{ name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
				],
				responses: { '200': { description: 'List of practice cards' } },
			},
		},
		'/api/practices/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Get practice', responses: { '200': { description: 'Practice' }, '404': { description: 'Not found' } } },
			patch: { summary: 'Update practice', responses: { '200': { description: 'Updated' } } },
			delete: { summary: 'Delete practice', responses: { '204': { description: 'Deleted' } } },
		},
		'/api/practices/{id}/details': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Get practice details', responses: { '200': { description: 'Details' }, '404': { description: 'Not found' } } },
		},

		// Round types
		'/api/round-types': {
			get: { summary: 'List round types', responses: { '200': { description: 'Array of round types' } } },
		},

		// Bows
		'/api/bows': {
			get: { summary: 'List bows', responses: { '200': { description: 'Array of bows' }, '401': { description: 'Unauthorized' } } },
			post: {
				summary: 'Create bow',
				responses: {
					'201': { description: 'Created' },
					'400': { description: 'Validation error' },
					'401': { description: 'Unauthorized' },
				},
			},
		},
		'/api/bows/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			patch: {
				summary: 'Update bow',
				responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' }, '401': { description: 'Unauthorized' } },
			},
			delete: {
				summary: 'Delete bow',
				responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' }, '401': { description: 'Unauthorized' } },
			},
		},

		// Bow Specifications
		'/api/bow-specifications': {
			get: {
				summary: 'List bow specifications',
				responses: { '200': { description: 'Array of bow specifications' }, '401': { description: 'Unauthorized' } },
			},
			post: {
				summary: 'Create bow specification',
				responses: {
					'201': { description: 'Created' },
					'400': { description: 'Validation error' },
					'401': { description: 'Unauthorized' },
				},
			},
		},
		'/api/bow-specifications/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: {
				summary: 'Get bow specification',
				responses: {
					'200': { description: 'Bow specification' },
					'404': { description: 'Not found' },
					'401': { description: 'Unauthorized' },
				},
			},
			put: {
				summary: 'Update bow specification',
				responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' }, '401': { description: 'Unauthorized' } },
			},
			delete: {
				summary: 'Delete bow specification',
				responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' }, '401': { description: 'Unauthorized' } },
			},
		},

		// Arrows
		'/api/arrows': {
			get: { summary: 'List arrows', responses: { '200': { description: 'Array of arrows' } } },
			post: { summary: 'Create arrow', responses: { '201': { description: 'Created' } } },
		},
		'/api/arrows/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Get arrow', responses: { '200': { description: 'Arrow' }, '404': { description: 'Not found' } } },
			patch: { summary: 'Update arrow', responses: { '200': { description: 'Updated' } } },
			delete: { summary: 'Delete arrow', responses: { '204': { description: 'Deleted' } } },
		},

		// Sight marks
		'/api/sight-marks': {
			get: { summary: 'List sight marks', responses: { '200': { description: 'Array of sight marks' } } },
			post: { summary: 'Create sight mark', responses: { '201': { description: 'Created' } } },
		},
		'/api/sight-marks/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Get sight mark', responses: { '200': { description: 'Sight mark' }, '404': { description: 'Not found' } } },
			patch: { summary: 'Update sight mark', responses: { '200': { description: 'Updated' } } },
			delete: { summary: 'Delete sight mark', responses: { '204': { description: 'Deleted' } } },
		},
		'/api/sight-marks/{id}/results': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
			get: { summary: 'Sight mark results', responses: { '200': { description: 'Array of results' } } },
		},
		'/api/sight-marks/calculate': {
			post: { summary: 'Calculate sight marks', responses: { '200': { description: 'Calculated values' } } },
		},

		// Ballistics
		'/api/ballistics/calculate': {
			post: { summary: 'Calculate ballistics', responses: { '200': { description: 'Calculated values' } } },
		},

		// Stats
		'/api/stats': {
			get: { summary: 'Get stats', responses: { '200': { description: 'Stats payload' } } },
		},
	},
};

export async function GET() {
	return NextResponse.json(spec);
}
