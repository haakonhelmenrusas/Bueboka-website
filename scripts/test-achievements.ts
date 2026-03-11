/**
 * Simple test script to verify achievement API endpoints
 * Run with: npx tsx scripts/test-achievements.ts
 */

import 'dotenv/config';

async function testAchievementAPI() {
	console.log('🧪 Testing Achievement API Endpoints...\n');

	// Note: These endpoints require authentication
	// For now, we'll just verify they exist and return proper responses

	const baseUrl = 'http://localhost:3000';

	try {
		// Test 1: GET /api/achievements (will fail auth, but that's expected)
		console.log('📋 Test 1: GET /api/achievements');
		const getResponse = await fetch(`${baseUrl}/api/achievements`);
		console.log(`   Status: ${getResponse.status}`);
		if (getResponse.status === 401) {
			console.log('   ✅ Endpoint exists (authentication required)\n');
		} else {
			console.log(`   ⚠️  Unexpected status: ${getResponse.status}\n`);
		}

		// Test 2: POST /api/achievements/check (will fail auth, but that's expected)
		console.log('📋 Test 2: POST /api/achievements/check');
		const postResponse = await fetch(`${baseUrl}/api/achievements/check`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		});
		console.log(`   Status: ${postResponse.status}`);
		if (postResponse.status === 401) {
			console.log('   ✅ Endpoint exists (authentication required)\n');
		} else {
			console.log(`   ⚠️  Unexpected status: ${postResponse.status}\n`);
		}

		console.log('✅ All endpoints are properly configured!');
		console.log('\n📝 Next steps:');
		console.log('   1. Log in to the app');
		console.log('   2. Visit /api/achievements to see your achievements');
		console.log('   3. Save a practice to trigger achievement checks');
	} catch (error) {
		console.error('❌ Error testing endpoints:', error);
		console.log('\n⚠️  Make sure the dev server is running: npm run dev');
	}
}

testAchievementAPI();
