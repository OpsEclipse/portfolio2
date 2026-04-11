import { anthropic } from '@ai-sdk/anthropic';
import { stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';

import {
	getGreetingSystemPrompt,
	getSystemPrompt,
	normalizeChatMode,
} from '../prompts.js';
import { MODELS, NAMESPACES } from '../rag/constants.js';
import { createSearchPortfolioContext } from './searchPortfolioContext.js';

const SEARCH_FOCUS_VALUES = [
	NAMESPACES.PERSONAL,
	NAMESPACES.PROFESSIONAL,
	NAMESPACES.ABOUT_RAG,
	'all',
];

export function createRunSonnetAgent({
	streamTextImpl = streamText,
	modelFactory = anthropic,
	searchPortfolioContext = createSearchPortfolioContext(),
} = {}) {
	return async function runSonnetAgent({ messages, mode, isGreeting }) {
		const normalizedMode = normalizeChatMode(mode);
		const toolCalls = [];
		const retrievalState = { used: false };
		const result = streamTextImpl({
			model: modelFactory(MODELS.CHAT),
			system: isGreeting
				? getGreetingSystemPrompt()
				: getSystemPrompt(normalizedMode),
			messages,
			temperature: normalizedMode === 'slang' ? 0.9 : 0.8,
			...(isGreeting
				? {}
				: {
						tools: {
							searchPortfolioContext: tool({
								description:
									'Search Sparsh portfolio knowledge across projects, background, and RAG implementation details.',
								inputSchema: z.object({
									query: z.string().min(1),
									focus: z.enum(SEARCH_FOCUS_VALUES).optional(),
								}),
								execute: async (input) => {
									retrievalState.used = true;
									const payload = await searchPortfolioContext(input);
									toolCalls.push(...payload.sources);
									return payload;
								},
							}),
						},
						stopWhen: stepCountIs(5),
					}),
		});

		return {
			textStream: result.textStream,
			toolDocs: toolCalls,
			retrievalState,
		};
	};
}
