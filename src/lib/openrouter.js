import OpenAI from 'openai';

let openrouterClient = null;

export function getOpenRouterClient() {
	if (!openrouterClient) {
		if (!process.env.OPENROUTER_API_KEY) {
			throw new Error('OPENROUTER_API_KEY environment variable is not set');
		}
		openrouterClient = new OpenAI({
			baseURL: 'https://openrouter.ai/api/v1',
			apiKey: process.env.OPENROUTER_API_KEY,
		});
	}
	return openrouterClient;
}
