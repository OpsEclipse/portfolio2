import { generateText } from 'ai';

import {
	createAnthropicCachedSystemMessage,
	portfolioAnthropic,
} from '../anthropic.js';
import { MODELS } from '../rag/constants.js';

export const COMPACTION_SYSTEM_PROMPT = `
You compress older chat history for a follow-up model call.

Write one short factual paragraph.
Keep decisions, user preferences, corrections, unresolved questions, and any
important named facts.
Drop filler, repetition, greetings, and small talk unless they matter later.
Prefer concrete wording over vague wording.
Do not add new information.
Do not speak to the user.
Do not use bullets or markdown.
`.trim();

function formatTranscript(messages = []) {
	return messages
		.map((message) => {
			const role =
				message?.role === 'assistant'
					? 'Assistant'
					: message?.role === 'system'
						? 'System'
						: 'User';
			return `${role}: ${message?.content || ''}`;
		})
		.join('\n');
}

export function createConversationCompactor({
	generateTextImpl = generateText,
	modelFactory = portfolioAnthropic,
} = {}) {
	return async function compactConversation({
		existingSummary = '',
		messages = [],
	} = {}) {
		if (!messages.length) {
			return existingSummary.trim();
		}

		const prompt = `
Existing summary:
${existingSummary.trim() || 'None'}

New transcript to fold into the summary:
${formatTranscript(messages)}
`.trim();

		const result = await generateTextImpl({
			model: modelFactory(MODELS.CHAT),
			system: createAnthropicCachedSystemMessage(COMPACTION_SYSTEM_PROMPT),
			prompt,
		});

		return result.text.trim();
	};
}

export const compactConversation = createConversationCompactor();
