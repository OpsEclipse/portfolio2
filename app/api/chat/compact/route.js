import { compactConversation } from '@/lib/chat/compactConversation.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
	try {
		let payload;
		try {
			payload = await request.json();
		} catch {
			return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const { summary = '', messages } = payload ?? {};
		if (!Array.isArray(messages)) {
			return Response.json(
				{ error: 'Messages array is required' },
				{ status: 400 }
			);
		}

		const nextSummary = await compactConversation({
			existingSummary: summary,
			messages,
		});

		return Response.json({ summary: nextSummary });
	} catch (error) {
		console.error('Chat compaction error:', error);
		return Response.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
