export function shouldShowChatEmptyState({ isLoaded, showInitializing, messages }) {
	return isLoaded && !showInitializing && messages.length === 0;
}

export function shouldShowChatSuggestions({ hasSubmittedUserMessage, messages }) {
	return !hasSubmittedUserMessage && !messages.some((message) => message.role === 'user');
}

export function hasMessageStatusLabel(message) {
	return Boolean(message?.statusLabel);
}

export function applyChatEventToMessages(messages = [], event = {}) {
	const updated = [...messages];
	const lastIndex = updated.length - 1;
	const lastMessage = updated[lastIndex];

	if (!lastMessage || lastMessage.role !== 'assistant') {
		return updated;
	}

	if (event.type === 'status') {
		updated[lastIndex] = {
			...lastMessage,
			statusLabel: event.label || '',
		};
		return updated;
	}

	if (event.type === 'content' && event.content) {
		updated[lastIndex] = {
			...lastMessage,
			content: `${lastMessage.content || ''}${event.content}`,
		};
	}

	return updated;
}

export function parseSseChunk(buffer = '', chunk = '') {
	const combined = `${buffer}${chunk}`;
	const lines = combined.split('\n');
	const remainder = combined.endsWith('\n') ? '' : lines.pop() || '';
	const events = [];

	for (const line of lines) {
		if (!line.startsWith('data: ')) {
			continue;
		}

		const data = line.slice(6);
		if (!data || data === '[DONE]') {
			continue;
		}

		try {
			events.push(JSON.parse(data));
		} catch {
			// Keep ignoring malformed payloads, but only after full lines are assembled.
		}
	}

	return { events, remainder };
}
