'use client';

import { memo } from 'react';

const MESSAGE_STYLES = {
	ai: {
		container: 'text-left',
		prefixClass: 'text-blue-900 font-[4px]',
		prefix: '>',
	},
	user: {
		container: 'text-left opacity-50',
		prefixClass: 'text-green-900 font-[4px]',
		prefix: '>',
	},
};

function ChatMessage({ variant = 'ai', children }) {
	const style = MESSAGE_STYLES[variant] ?? MESSAGE_STYLES.ai;

	return (
		<p className={style.container}>
			<span className={style.prefixClass}>{style.prefix}</span>{' '}
			{children}
		</p>
	);
}

export default memo(ChatMessage);
