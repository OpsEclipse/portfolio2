export function shouldShowChatEmptyState({ isLoaded, showInitializing, messages }) {
	return isLoaded && !showInitializing && messages.length === 0;
}

export function shouldShowChatSuggestions({ hasSubmittedUserMessage, messages }) {
	return !hasSubmittedUserMessage && !messages.some((message) => message.role === 'user');
}

export function hasMessageStatusLabel(message) {
	return Boolean(message?.statusLabel);
}

export function getAssistantMessageStatusPresentation(message = {}) {
	if (message?.pendingLabel) {
		return {
			label: message.pendingLabel,
			className: 'chat-thinking-text inline-block',
		};
	}

	return {
		label: message?.statusLabel || '',
		className: 'text-xs text-neutral-700',
	};
}

export function applyChatEventToMessages(messages = [], event = {}) {
	const updated = [...messages];
	const lastIndex = updated.length - 1;
	const lastMessage = updated[lastIndex];

	if (!lastMessage || lastMessage.role !== 'assistant') {
		return updated;
	}

	if (event.type === 'status') {
		const nextMessage = {
			...lastMessage,
			statusLabel: event.label || '',
		};
		if ('pendingLabel' in lastMessage) {
			nextMessage.pendingLabel = '';
		}
		updated[lastIndex] = {
			...nextMessage,
		};
		return updated;
	}

	if (event.type === 'content' && event.content) {
		const nextMessage = {
			...lastMessage,
			content: `${lastMessage.content || ''}${event.content}`,
			statusLabel: lastMessage.statusLabel || '',
		};
		if ('pendingLabel' in lastMessage) {
			nextMessage.pendingLabel = '';
		}
		updated[lastIndex] = nextMessage;
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
