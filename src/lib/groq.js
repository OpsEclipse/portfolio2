import OpenAI from 'openai';

let groqClient = null;

export function getGroqClient() {
	if (!groqClient) {
		if (!process.env.GROQ_API_KEY) {
			throw new Error('GROQ_API_KEY environment variable is not set');
		}
		console.log('Initializing Groq client with key:', process.env.GROQ_API_KEY?.slice(0, 10) + '...');
		groqClient = new OpenAI({
			baseURL: 'https://api.groq.com/openai/v1',
			apiKey: process.env.GROQ_API_KEY,
		});
	}
	return groqClient;
}
