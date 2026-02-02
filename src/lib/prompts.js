import { CONFIG } from './rag/constants';
import { extractDocText } from './rag/extractText';

/**
 * Define the specific scope of Sparsh's data.
 * This helps the AI manage user expectations.
 */
const KNOWLEDGE_OVERVIEW = `
### What I Know (Knowledge Categories):
1. **Professional Life:** - Work as a Software Engineer.
   - Education at University of Waterloo (systems design engineering).
   - Technical skills (Frontend, Backend, AI/ML), project repos, and career achievements.
2. **Personal Life:** - Personal interests, hobbies, and background stories.
   - Values and public-facing personal milestones.
3. **The System (RAG):** - How I retrieve info from Sparsh's vector database.
   - My operating modes (Professional vs. Casual).
`;

const BASE_CONSTRAINTS = `
### Rules:
* Refer to Sparsh in the third person.
* Use the Knowledge Categories above to guide your answers.
* If a query falls outside these three categories, politely redirect the user.
* **No Context?** If the search results ({context}) are empty, rely on your core knowledge of Sparsh at FriedmannAI/UWaterloo.
`;

const PROFESSIONAL_PROMPT = `
You are Sparsh Shah's Professional Chief of Staff.
**Vibe:** Sharp, efficient, and organized. 

${KNOWLEDGE_OVERVIEW}
${BASE_CONSTRAINTS}

### Contextual Data:
{context}`;

const CASUAL_PROMPT = `
You are Sparsh's AI sidekick. 
**Vibe:** Clever, low-key, and friendly.

${KNOWLEDGE_OVERVIEW}
${BASE_CONSTRAINTS}

### Memories:
{context}`;

export function getSystemPrompt(mode, contextDocs) {
	const isCasual = mode === 'casual';

	// Detailed fallback if the Vector DB returns nothing
	const fallbackContext = `
    [Note: No specific document matches found. Using general knowledge.]
    Sparsh is currently a Software Engineer at FriedmannAI and a student at the University of Waterloo.
    For more specific details, try asking about his technical projects or experience.
    `.trim();

	const contextText = contextDocs?.length
		? contextDocs
				.map((doc) => {
					const text = extractDocText(doc).trim();
					const heading =
						doc.metadata?.heading ||
						'General Information';
					// Tagging the doc with its metadata category if it exists
					const category = doc.metadata?.category
						? `[Category: ${doc.metadata.category}] `
						: '';
					return `#### ${category}${heading}\n${text}`;
				})
				.join('\n\n---\n\n')
		: fallbackContext;

	const baseTemplate = isCasual
		? CASUAL_PROMPT
		: PROFESSIONAL_PROMPT;
	return baseTemplate.replace('{context}', contextText);
}

export function formatSources(documents) {
	const usedDocs =
		documents?.filter(
			(doc) =>
				doc.rerankScore >= (CONFIG.MIN_RERANK_SCORE || 0.5)
		) || [];

	if (usedDocs.length === 0) return '';

	const sourceLines = usedDocs.map((doc) => {
		const title = doc.metadata?.doc_title || 'Reference Doc';
		const heading = doc.metadata?.heading
			? ` (${doc.metadata.heading})`
			: '';
		const url = doc.metadata?.source_url;
		const chunkId = doc.metadata?.chunk_id ?? doc.metadata?.chunkId ?? doc.id;
		const chunkLabel = chunkId ? ` (chunk ${chunkId})` : '';

		return url
			? `* [${title}](${url})${heading}${chunkLabel}`
			: `* ${title}${heading}${chunkLabel}`;
	});

	return `\n\n<<SOURCES>>\n${sourceLines.join('\n')}\n<</SOURCES>>`;
}
