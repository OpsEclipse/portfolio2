'use client';

import { memo } from 'react';
import Hourglass from 'lucide-react/dist/esm/icons/hourglass.js';
import { Window } from 'react95/dist/Window/Window.mjs';
import { WindowContent } from 'react95/dist/Window/WindowContent.mjs';
import { WindowHeader } from 'react95/dist/Window/WindowHeader.mjs';

function WindowLoader({ title = 'Loading', message = 'Working on it...', size = 32 }) {
	return (
		<div
			className="fixed inset-0 z-[90] flex items-center justify-center bg-black/10 backdrop-blur-[1px]"
			role="status"
			aria-live="polite"
		>
			<Window className="w-[260px]">
				<WindowHeader active="true" className="flex items-center">
					<span>{title}</span>
				</WindowHeader>
				<WindowContent className="flex items-center gap-3">
					<Hourglass size={size} className="animate-spin" />
					<span className="text-[12px]">{message}</span>
				</WindowContent>
			</Window>
		</div>
	);
}

export default memo(WindowLoader);
