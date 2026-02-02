'use client';

import { memo } from 'react';

const MESSAGE_STYLES = {
	ai: {
		container: 'text-left flex items-start gap-2',
		prefixClass: 'text-blue-900 font-[4px]',
		prefix: '>',
	},
	user: {
		container: 'text-left opacity-50 flex items-start gap-2',
		prefixClass: 'text-green-900 font-[4px]',
		prefix: '>',
	},
};

function isSafeUrl(url) {
	return /^https?:\/\/|^mailto:/.test(url);
}

function renderInlineMarkdown(text, keyBase) {
	const nodes = [];
	const tokenRegex = /(\*\*[^*]+?\*\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\)|\*[^*]+?\*)/g;
	let lastIndex = 0;
	let match;

	const pushText = (value) => {
		const parts = value.split('\n');
		parts.forEach((part, idx) => {
			if (part) {
				nodes.push(part);
			}
			if (idx < parts.length - 1) {
				nodes.push(<br key={`${keyBase}-br-${nodes.length}`} />);
			}
		});
	};

	while ((match = tokenRegex.exec(text))) {
		if (match.index > lastIndex) {
			pushText(text.slice(lastIndex, match.index));
		}

		const token = match[0];
		if (token.startsWith('**')) {
			nodes.push(
				<strong key={`${keyBase}-b-${nodes.length}`}>
					{token.slice(2, -2)}
				</strong>
			);
		} else if (token.startsWith('`')) {
			nodes.push(
				<code key={`${keyBase}-c-${nodes.length}`}>
					{token.slice(1, -1)}
				</code>
			);
		} else if (token.startsWith('[')) {
			const linkMatch = token.match(/^\[([^\]]+?)\]\(([^)]+?)\)$/);
			if (linkMatch && isSafeUrl(linkMatch[2])) {
				nodes.push(
					<a
						key={`${keyBase}-l-${nodes.length}`}
						href={linkMatch[2]}
						target="_blank"
						rel="noreferrer"
					>
						{linkMatch[1]}
					</a>
				);
			} else if (linkMatch) {
				nodes.push(linkMatch[1]);
			} else {
				nodes.push(token);
			}
		} else if (token.startsWith('*')) {
			nodes.push(
				<em key={`${keyBase}-i-${nodes.length}`}>
					{token.slice(1, -1)}
				</em>
			);
		}

		lastIndex = tokenRegex.lastIndex;
	}

	if (lastIndex < text.length) {
		pushText(text.slice(lastIndex));
	}

	return nodes;
}

function renderBlockMarkdown(text, keyBase) {
	const nodes = [];
	const lines = text.split('\n');
	let i = 0;

	const isHeading = (line) => /^\s*#{1,3}\s+/.test(line);
	const isOrdered = (line) => /^\s*\d+\.\s+/.test(line);
	const isUnordered = (line) => /^\s*[-*]\s+/.test(line);

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (isHeading(line)) {
			const level = Math.min(3, line.trim().match(/^#{1,3}/)?.[0].length || 1);
			const textContent = line.replace(/^\s*#{1,3}\s+/, '');
			const HeadingTag = `h${level}`;
			nodes.push(
				<HeadingTag
					key={`${keyBase}-h-${nodes.length}`}
					className="font-bold text-sm mt-2 mb-1"
				>
					{renderInlineMarkdown(textContent, `${keyBase}-h-${nodes.length}`)}
				</HeadingTag>
			);
			i += 1;
			continue;
		}

		if (isOrdered(line) || isUnordered(line)) {
			const listItems = [];
			const ordered = isOrdered(line);
			while (i < lines.length && (ordered ? isOrdered(lines[i]) : isUnordered(lines[i]))) {
				const raw = lines[i].replace(/^\s*(?:\d+\.|[-*])\s+/, '');
				listItems.push(raw);
				i += 1;
			}

			const ListTag = ordered ? 'ol' : 'ul';
			nodes.push(
				<ListTag
					key={`${keyBase}-list-${nodes.length}`}
					className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 mb-2`}
				>
					{listItems.map((item, idx) => (
						<li key={`${keyBase}-li-${nodes.length}-${idx}`}>
							{renderInlineMarkdown(item, `${keyBase}-li-${nodes.length}-${idx}`)}
						</li>
					))}
				</ListTag>
			);
			continue;
		}

		const paragraphLines = [line];
		i += 1;
		while (
			i < lines.length &&
			lines[i].trim() &&
			!isHeading(lines[i]) &&
			!isOrdered(lines[i]) &&
			!isUnordered(lines[i])
		) {
			paragraphLines.push(lines[i]);
			i += 1;
		}

		nodes.push(
			<p key={`${keyBase}-p-${nodes.length}`} className="mb-2 last:mb-0">
				{renderInlineMarkdown(paragraphLines.join('\n'), `${keyBase}-p-${nodes.length}`)}
			</p>
		);
	}

	return nodes;
}

function renderMarkdown(content) {
	if (!content) return null;
	const parts = content.split('```');
	const nodes = [];

	parts.forEach((part, idx) => {
		if (idx % 2 === 1) {
			const lines = part.split('\n');
			const hasLanguage = lines.length > 1 && lines[0].trim().length > 0;
			const code = hasLanguage ? lines.slice(1).join('\n') : part;
			nodes.push(
				<pre key={`code-${idx}`} className="whitespace-pre-wrap">
					<code>{code}</code>
				</pre>
			);
		} else if (part) {
			nodes.push(...renderBlockMarkdown(part, `block-${idx}`));
		}
	});

	return nodes;
}

function ChatMessage({ variant = 'ai', content = '', children }) {
	const style = MESSAGE_STYLES[variant] ?? MESSAGE_STYLES.ai;

	return (
		<div className={style.container}>
			<span className={style.prefixClass}>{style.prefix}</span>
			<div className="chat-message__content">
				{renderMarkdown(content)}
				{children}
			</div>
		</div>
	);
}

export default memo(ChatMessage);
