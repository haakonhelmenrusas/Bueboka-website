'use client';
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
	// Render Swagger UI pointing to our openapi route
	return (
		<div style={{ padding: 24 }}>
			<h1 style={{ marginBottom: 16 }}>API docs</h1>
			<SwaggerUI url="/api/openapi" docExpansion="list" defaultModelExpandDepth={1} />
		</div>
	);
}
