export const CHAT_COMPACTION_INTERVAL = 14;
export const CHAT_COMPACTION_VERBATIM_TAIL = 2;

export function buildSummarySystemMessage(summary = '') {
	return {
		role: 'system',
		content: `Conversation summary:\n${summary.trim()}`,
	};
}

export function getCompactionPlan({
	messages = [],
	compactedMessageCount = 0,
} = {}) {
	if (
		messages.length < CHAT_COMPACTION_INTERVAL ||
		messages.length % CHAT_COMPACTION_INTERVAL !== 0
	) {
		return null;
	}

	const nextCompactedMessageCount = Math.max(
		compactedMessageCount,
		messages.length - CHAT_COMPACTION_VERBATIM_TAIL
	);

	if (nextCompactedMessageCount <= compactedMessageCount) {
		return null;
	}

	return {
		messagesToCompact: messages.slice(
			compactedMessageCount,
			nextCompactedMessageCount
		),
		nextCompactedMessageCount,
	};
}

export function buildMessagesForModel({
	summary = '',
	messages = [],
	compactedMessageCount = 0,
} = {}) {
	const verbatimMessages = messages.slice(compactedMessageCount);

	if (!summary.trim()) {
		return verbatimMessages;
	}

	return [buildSummarySystemMessage(summary), ...verbatimMessages];
}
