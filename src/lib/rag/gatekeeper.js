import { getGroqClient } from '../groq';
import { getOpenRouterClient } from '../openrouter';
import { MODELS, NAMESPACES } from './constants';

const GATEKEEPER_PROMPT = `You are an intent classifier for a personal portfolio RAG system. Your job is to:
1. Determine which namespace(s) to search, or none if it's general knowledge
2. Rewrite the query for better semantic search if needed (if searching)

Namespaces:
- "personal_life": Hobbies, interests, personal background, life outside work, consumer products, and general biography.
- "professional_life": Work experience, projects, skills, education, career, technical tools, frameworks, and professional certifications.
- "about_rag": The architecture of this system, technologies used to build this bot, and its implementation details.

Rules:
- Return an EMPTY array [] for general knowledge questions, greetings, or things unrelated to Sparsh.
- Return ONE namespace ONLY if the query is explicitly and exclusively about one category.
- **AMBIGUITY RULE:** If a query mentions a specific brand, tool, or entity (e.g., "Firestone", "Evernote", "AWS") without clear context, you MUST include both "personal_life" and "professional_life". 
- **COVERAGE BIAS:** When in doubt, or if a query is open-ended ("Tell me about..."), always prioritize multiple namespaces to ensure the RAG system retrieves all relevant context.

Respond ONLY with valid JSON in this exact format:
{"namespaces": ["namespace1", "namespace2"], "refinedQuery": "<rewritten query>"}
or for general knowledge:
{"namespaces": [], "refinedQuery": ""}

Examples:
User: "What are Sparsh's hobbies?"
{"namespaces": ["personal_life"], "refinedQuery": "Sparsh hobbies interests activities personal life"}

User: "Has Sparsh ever used Firestone?"
{"namespaces": ["personal_life", "professional_life"], "refinedQuery": "Sparsh Firestone usage experience professional tools personal interests"}

User: "Tell me about his work experience"
{"namespaces": ["professional_life"], "refinedQuery": "Sparsh work experience employment history career jobs"}

User: "How did he build this?"
{"namespaces": ["professional_life", "about_rag"], "refinedQuery": "Sparsh technical projects portfolio development RAG system implementation architecture"}

User: "What's the weather like?"
{"namespaces": [], "refinedQuery": ""}

User: "Hello!"
{"namespaces": [], "refinedQuery": ""}`;

const DEFAULT_GATEKEEPER_RESULT = {
	namespaces: [],
	refinedQuery: '',
	skipRAG: true,
};

function safeParseGatekeeperResponse(content) {
	if (!content) {
		return DEFAULT_GATEKEEPER_RESULT;
	}

	try {
		const start = content.indexOf('{');
		const end = content.lastIndexOf('}');

		if (start === -1 || end === -1) {
			return DEFAULT_GATEKEEPER_RESULT;
		}

		const jsonStr = content.substring(start, end + 1);
		return { parsed: JSON.parse(jsonStr) };
	} catch (error) {
		console.error('Gatekeeper JSON parse failed:', error.message);
		return DEFAULT_GATEKEEPER_RESULT;
	}
}

async function callLLM(client, model, query, systemPrompt = GATEKEEPER_PROMPT) {
	const response = await client.chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: query },
		],
		temperature: 0.1,
		max_tokens: 150,
	});

	const content = response.choices[0]?.message?.content?.trim() || '';

	const parsedResult = safeParseGatekeeperResponse(content);
	if (parsedResult === DEFAULT_GATEKEEPER_RESULT) {
		const strictPrompt = `${GATEKEEPER_PROMPT}\n\nIMPORTANT: Respond with ONLY valid JSON. No extra text.`;
		const strictResponse = await client.chat.completions.create({
			model,
			messages: [
				{ role: 'system', content: strictPrompt },
				{ role: 'user', content: query },
			],
			temperature: 0.1,
			max_tokens: 150,
		});

		const strictContent = strictResponse.choices[0]?.message?.content?.trim() || '';
		const strictParsedResult = safeParseGatekeeperResponse(strictContent);
		if (strictParsedResult === DEFAULT_GATEKEEPER_RESULT) {
			return DEFAULT_GATEKEEPER_RESULT;
		}

		const { parsed: strictParsed } = strictParsedResult;
		const validNamespaces = Object.values(NAMESPACES);
		const namespaces = Array.isArray(strictParsed.namespaces) ? strictParsed.namespaces : [];
		const filteredNamespaces = namespaces.filter((ns) => validNamespaces.includes(ns));

		return {
			namespaces: filteredNamespaces,
			refinedQuery: strictParsed.refinedQuery || query,
			skipRAG: filteredNamespaces.length === 0,
		};
	}
	const { parsed } = parsedResult;

	// Validate namespaces array
	const validNamespaces = Object.values(NAMESPACES);
	const namespaces = Array.isArray(parsed.namespaces) ? parsed.namespaces : [];
	const filteredNamespaces = namespaces.filter((ns) => validNamespaces.includes(ns));

	return {
		namespaces: filteredNamespaces,
		refinedQuery: parsed.refinedQuery || query,
		skipRAG: filteredNamespaces.length === 0,
	};
}

export async function classifyIntent(query) {
	// Try Groq first
	try {
		const groq = getGroqClient();
		return await callLLM(groq, MODELS.GATEKEEPER_FALLBACK, query);
	} catch (error) {
		console.error('Groq gatekeeper failed, trying OpenRouter fallback:', error.message);
	}

	// Fallback to OpenRouter
	try {
		const openrouter = getOpenRouterClient();
		return await callLLM(openrouter, MODELS.GATEKEEPER, query);
	} catch (error) {
		console.error('OpenRouter gatekeeper also failed:', error.message);
	}

	// Final fallback: skip RAG
	return DEFAULT_GATEKEEPER_RESULT;
}
