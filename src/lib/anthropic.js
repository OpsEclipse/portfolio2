import { createAnthropic } from '@ai-sdk/anthropic';

export const ANTHROPIC_PROMPT_CACHING_BETA = 'prompt-caching-2024-07-31';
export const ANTHROPIC_SYSTEM_CACHE_CONTROL = { type: 'ephemeral' };

export function createPortfolioAnthropicProvider({
	createProvider = createAnthropic,
} = {}) {
	return createProvider({
		headers: {
			'anthropic-beta': ANTHROPIC_PROMPT_CACHING_BETA,
		},
	});
}

export function createAnthropicCachedSystemMessage(content) {
	return {
		role: 'system',
		content,
		providerOptions: {
			anthropic: {
				cacheControl: {
					...ANTHROPIC_SYSTEM_CACHE_CONTROL,
				},
			},
		},
	};
}

export const portfolioAnthropic = createPortfolioAnthropicProvider();
