import { getGroqClient } from '../groq';
import { getOpenRouterClient } from '../openrouter';
import { MODELS, NAMESPACES } from './constants';

const GATEKEEPER_PROMPT = `You are an intent classifier for a personal portfolio RAG system. Your job is to:
1. Determine which namespace(s) to search, or none if it's general knowledge
2. Rewrite the query for better semantic search (if searching)

Namespaces:
- "personal_life": Hobbies, interests, personal background, life outside work, consumer products, and general biography.
- "professional_life": Work experience, projects, skills, education, career, technical tools, frameworks, and professional certifications.
- "about_rag": The architecture of this system, technologies used to build this bot, and its implementation details.

Rules:
- Return an EMPTY array [] for general knowledge questions, greetings, or things unrelated to Sparsh.
- Return ONE namespace ONLY if the query is explicitly and exclusively about one category.
- **Contact Info Rule:** If the user asks for contact info (email, phone, resume, LinkedIn, GitHub, website, or “how to reach”), you MUST include "professional_life".
- **AMBIGUITY RULE:** If a query mentions a specific brand, tool, or entity (e.g., "Firestone", "Evernote", "AWS") without clear context, you MUST include both "personal_life" and "professional_life". 
- **COVERAGE BIAS:** When in doubt, or if a query is open-ended ("Tell me about..."), always prioritize multiple namespaces to ensure the RAG system retrieves all relevant context.
- **Rewrite Rule:** Do NOT produce keyword lists. Return a short natural-language query (one sentence, ~6–20 words) that preserves all key details (names, tech, timeframes, constraints). Never drop specific nouns. Do NOT add new named entities (including "Sparsh"). Avoid exhaustive phrasing like "list all" or "everything". You MAY add up to 3 generic descriptors based on the chosen namespaces to make intent clear (e.g., for professional: roles, projects, skills; for personal: interests, hobbies; for about_rag: architecture, implementation). Keep pronouns if present; if you rewrite, use neutral phrasing instead of adding a name. If the original is already specific, return it unchanged.

Respond ONLY with valid JSON in this exact format:
{"namespaces": ["namespace1", "namespace2"], "refinedQuery": "<rewritten query>"}
or for general knowledge:
{"namespaces": [], "refinedQuery": ""}

Examples:
User: "What are Sparsh's hobbies?"
{"namespaces": ["personal_life"], "refinedQuery": "What are his hobbies and personal interests?"}

User: "Has Sparsh ever used Firestone?"
{"namespaces": ["personal_life", "professional_life"], "refinedQuery": "Firestone usage in personal life or at work, including projects or experience"}

User: "Tell me about his work experience"
{"namespaces": ["professional_life"], "refinedQuery": "His work experience, roles, responsibilities, and projects"}

User: "How did he build this?"
{"namespaces": ["professional_life", "about_rag"], "refinedQuery": "How was this RAG system and portfolio built, including architecture and implementation?"}

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

		const { parsed: strictParsedRaw } = strictParsedResult;
		const strictParsed =
			strictParsedRaw && typeof strictParsedRaw === 'object'
				? strictParsedRaw
				: {};
		const validNamespaces = Object.values(NAMESPACES);
		const namespaces = Array.isArray(strictParsed.namespaces) ? strictParsed.namespaces : [];
		const filteredNamespaces = namespaces.filter((ns) => validNamespaces.includes(ns));

		return {
			namespaces: filteredNamespaces,
			refinedQuery: strictParsed.refinedQuery || query,
			skipRAG: filteredNamespaces.length === 0,
		};
	}
	const { parsed: parsedRaw } = parsedResult;
	const parsed = parsedRaw && typeof parsedRaw === 'object' ? parsedRaw : {};

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
