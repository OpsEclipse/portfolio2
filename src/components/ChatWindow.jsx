'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react95/dist/Button/Button.mjs';
import { ScrollView } from 'react95/dist/ScrollView/ScrollView.mjs';
import { Radio } from 'react95/dist/Radio/Radio.mjs';
import { TextInput } from 'react95/dist/TextInput/TextInput.mjs';
import { Window } from 'react95/dist/Window/Window.mjs';
import { WindowContent } from 'react95/dist/Window/WindowContent.mjs';
import { WindowHeader } from 'react95/dist/Window/WindowHeader.mjs';
import ChatMessage from './ChatMessage';
import Loader from './Loader';
import { usePortfolio } from '../context/PortfolioContext';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 320;
const VIEWPORT_PADDING = 12;
const DEFAULT_POSITION = { x: 700, y: 175 };
const ICON_SIZE = 56;
const MOBILE_BREAKPOINT = 640;
const SOURCE_MARKER = '\n\n<<SOURCES>>\n';
const SOURCE_MARKER_ALT = '\n<<SOURCES>>\n';
const SOURCE_MARKER_END = '\n<</SOURCES>>';
const MINIMIZED_ICON_SRC =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAAEEfUpiAAAACXBIWXMAAAsSAAALEgHS3X78AAAQR0lEQVRYCQE8EMPvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AAAA/wIAAAAAAAAA/wAAAADAwMAAAgAAAAAAAAABAIAAAEBAQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICA/4CAAP8AAAAAAYAAgP8AAAAAAAAAAIAAgAEAAAAAAAAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAgACA/wAAAAAAAAAAAAAAAAIAAAAAAAAAAICAgP+AAID/AICAAP//AP+AAID/AAAAAAAAAAAAgACA/4CAgP//////AAAA/8DAwP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID///8A/4AAgP8AAAAAAAAAAAIAAAAAAAAAAIAAgP8AAAAAAAAAAAAAAAAAAAD/AAAAAAIAAAAAgICA/wAAAAB//4AAgQGAAACAAAAAAAAAAAAAAAQAAAAAAIAAAH//fwCBgQAAAIAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAACAAID/gICA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgID/AIAAAAAAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAACAgID/AIAAAACAAAAAAAAAAAAAAP//AACBgQD/AICAAAAAAACAAIABAAAAAAEAAAAAAAAAAAAAAACAgID/AIAAAAAAAAAAAAAAAAAAAACAgAAAgIAAAAAAAAAAAAAAgAAAgICAAAAAAAEAAAAAAgAAAAAAAAAAgACA/0BAQAB//38AAIAAAIAAgAAAAAAAAICAAAAAAAAAgAAAQMBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAID/gICA////////////wMDA/4CAgP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgP8AgAAAAIAAAAAAAACAAIAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AIAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACA/wCAAAAAgAAAAAAAAAAAAAAAAAAAf/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAgQGAAAAAAAAAAAAAAAAAAIAAgAAAAAAAAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgP8AgAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICAAH9/AAAAAAAAgYEAAACAgAAAAAAAAAAAAIAAgAAAAAABAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AIAAAACAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgIAAf38AAAAAAACBgQAAAAAAAIEBgAAAAAAAAAAAAAAAAACAAIAAgICAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAgACA/4AAgAAAAAAAAAAAAIAAgAAAAAAAAAAAAAAAAAAAAAAAAICAAH9/AACBgQAAAICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAICAgABAQEAAAAAAAEBAQAAAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAgACA/4AAgADAwMAAAAAAAMDAwAAAAAAAgICAAAAAAACAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgACAgIAAQEBAAAAAAAAAAAAAwMDAAACAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz8/AD8/PwAAAAAAf39/AAAAAACBgYEAAAAAAICAgAAAAAAAgACAAAAAAACAAIAAgICAAMBAwAAAAAAAAAAAAMDAwAAAgAAAgACAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAgACAAAAAAAAAgAAAAAAAAH9/fwAAAAAAAAAAAAAAAAAAAAAAgYGBAAAAAABAQEAAAAAAAAAAAADAwMAAAIAAAIAAgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAIAAgAAAAAAAAIAAAAAAAAB/f38AAAAAAAAAAADBwcEAwMDAAACAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAACAAIAAAAAAAACAAAAAgAAAgACAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOohZMrBgjdjAAAAAElFTkSuQmCC';

const GREETING_LOCATION = 'Oakville, Ontario, Canada';
const GREETING_TIMEZONE = 'America/Toronto';

const SAFE_URL_REGEX = /^https?:\/\/|^mailto:/;

function isSafeUrl(url) {
	return SAFE_URL_REGEX.test(url);
}

function splitSources(content = '') {
	let marker = SOURCE_MARKER;
	let idx = content.indexOf(marker);
	if (idx === -1) {
		marker = SOURCE_MARKER_ALT;
		idx = content.indexOf(marker);
	}
	if (idx === -1) {
		return { body: content, sourcesText: '' };
	}
	const endIdx = content.indexOf(SOURCE_MARKER_END, idx + marker.length);
	const sourcesEnd = endIdx === -1 ? content.length : endIdx;
	return {
		body: content.slice(0, idx).trim(),
		sourcesText: content.slice(idx + marker.length, sourcesEnd).trim(),
	};
}

function getDayOfYear(year, month, day) {
	const start = Date.UTC(year, 0, 1);
	const current = Date.UTC(year, month - 1, day);
	return Math.floor((current - start) / 86400000) + 1;
}

function getSeason(month) {
	if (month === 12 || month <= 2) return 'winter';
	if (month <= 5) return 'spring';
	if (month <= 8) return 'summer';
	return 'fall';
}

function buildGreetingContext() {
	const now = new Date();
	const dateKey = new Intl.DateTimeFormat('en-CA', {
		timeZone: GREETING_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(now);
	const [year, month, day] = dateKey.split('-').map(Number);
	const dayOfYear = getDayOfYear(year, month, day);
	const season = getSeason(month);
	const dateLong = new Intl.DateTimeFormat('en-US', {
		timeZone: GREETING_TIMEZONE,
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(now);
	const dayOfWeek = new Intl.DateTimeFormat('en-US', {
		timeZone: GREETING_TIMEZONE,
		weekday: 'long',
	}).format(now);
	const timeShort = new Intl.DateTimeFormat('en-US', {
		timeZone: GREETING_TIMEZONE,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		timeZoneName: 'short',
	}).format(now);
	const timeZoneLong =
		new Intl.DateTimeFormat('en-US', {
			timeZone: GREETING_TIMEZONE,
			hour: 'numeric',
			timeZoneName: 'long',
		})
			.formatToParts(now)
			.find((part) => part.type === 'timeZoneName')?.value || 'Eastern Time';

	return [
		`App summary: Sparsh's portfolio and chat navigator.`,
		`Sparsh location: ${GREETING_LOCATION}`,
		`Local date: ${dateLong}`,
		`Day of week: ${dayOfWeek}`,
		`Local time: ${timeShort}`,
		`Time zone: ${timeZoneLong}`,
		`Day of year: ${dayOfYear}`,
		`Season: ${season}`,
	].join('\n');
}

function parseSources(sourcesText = '') {
	if (!sourcesText) return [];
	return sourcesText
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const raw = line.replace(/^\*\s+/, '');
			const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)(.*)$/);
			if (linkMatch) {
				return {
					title: linkMatch[1],
					url: linkMatch[2],
					meta: linkMatch[3]?.trim() || '',
				};
			}
			return { title: raw, url: '', meta: '' };
		});
}

function ChatWindow() {
	const resizeRef = useRef(null);
	const resizeCleanupRef = useRef(null);
	const windowRef = useRef(null);
	const scrollRef = useRef(null);
	const sizeRef = useRef({ width: 450, height: 700 });
	const [size, setSize] = useState(sizeRef.current);
	const [position, setPosition] = useState(DEFAULT_POSITION);
	const positionRef = useRef(DEFAULT_POSITION);
	const [isMounted, setIsMounted] = useState(false);
	const [mode, setMode] = useState('casual');
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rateLimitUntil, setRateLimitUntil] = useState(null);
	const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
	const [showInitializing, setShowInitializing] = useState(true);
	const { isLoaded } = usePortfolio();
	const scrollRafRef = useRef(0);
	const [isMinimized, setIsMinimized] = useState(false);
	const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
	const iconPositionRef = useRef({ x: 0, y: 0 });
	const hasInitializedResponsive = useRef(false);
	const hasRequestedGreeting = useRef(false);

	const handleModeChange = (event) => {
		setMode(event.target.value);
	};

	const scrollToBottom = useCallback(
		(behavior = 'smooth') => {
			if (!scrollRef.current) return;
			const scrollElement =
				scrollRef.current.querySelector('[class*="ScrollView"]') || scrollRef.current;
			if (!scrollElement?.scrollTo) return;

			if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
			scrollRafRef.current = requestAnimationFrame(() => {
				scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior });
			});
		},
		[]
	);

	useEffect(() => {
		scrollToBottom(isLoading ? 'auto' : 'smooth');
	}, [isLoading, messages, scrollToBottom]);

	useEffect(() => {
		return () => {
			if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
		};
	}, []);

	useEffect(() => {
		if (!rateLimitUntil) {
			setRateLimitRemaining(0);
			return undefined;
		}

		const updateRemaining = () => {
			const remainingMs = rateLimitUntil - Date.now();
			const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
			setRateLimitRemaining(remainingSec);
			if (remainingMs <= 0) {
				setRateLimitUntil(null);
			}
		};

		updateRemaining();
		const interval = window.setInterval(updateRemaining, 1000);
		return () => window.clearInterval(interval);
	}, [rateLimitUntil]);

	useEffect(() => {
		sizeRef.current = size;
	}, [size]);

	useEffect(() => {
		positionRef.current = position;
	}, [position]);

	const clampToViewport = useCallback((nextSize = sizeRef.current, nextPosition = positionRef.current) => {
		const maxWidth = Math.max(0, window.innerWidth - VIEWPORT_PADDING * 2);
		const maxHeight = Math.max(0, window.innerHeight - VIEWPORT_PADDING * 2);
		const minWidth = Math.min(MIN_WIDTH, maxWidth);
		const minHeight = Math.min(MIN_HEIGHT, maxHeight);

		const clampedWidth = Math.min(Math.max(nextSize.width, minWidth), maxWidth);
		const clampedHeight = Math.min(Math.max(nextSize.height, minHeight), maxHeight);

		if (clampedWidth !== sizeRef.current.width || clampedHeight !== sizeRef.current.height) {
			sizeRef.current = { width: clampedWidth, height: clampedHeight };
			setSize({ width: clampedWidth, height: clampedHeight });
		}

		const maxX = window.innerWidth - clampedWidth - VIEWPORT_PADDING;
		const maxY = window.innerHeight - clampedHeight - VIEWPORT_PADDING;
		const clampedX = Math.min(Math.max(nextPosition.x, VIEWPORT_PADDING), Math.max(maxX, VIEWPORT_PADDING));
		const clampedY = Math.min(Math.max(nextPosition.y, VIEWPORT_PADDING), Math.max(maxY, VIEWPORT_PADDING));

		if (clampedX !== positionRef.current.x || clampedY !== positionRef.current.y) {
			positionRef.current = { x: clampedX, y: clampedY };
			setPosition({ x: clampedX, y: clampedY });
		}
	}, []);

	const clampIconToViewport = useCallback((nextPosition = iconPositionRef.current) => {
		const maxX = window.innerWidth - ICON_SIZE - VIEWPORT_PADDING;
		const maxY = window.innerHeight - ICON_SIZE - VIEWPORT_PADDING;
		const clampedX = Math.min(Math.max(nextPosition.x, VIEWPORT_PADDING), Math.max(maxX, VIEWPORT_PADDING));
		const clampedY = Math.min(Math.max(nextPosition.y, VIEWPORT_PADDING), Math.max(maxY, VIEWPORT_PADDING));

		if (clampedX !== iconPositionRef.current.x || clampedY !== iconPositionRef.current.y) {
			iconPositionRef.current = { x: clampedX, y: clampedY };
			setIconPosition({ x: clampedX, y: clampedY });
		}
	}, []);

	useEffect(() => {
		setIsMounted(true);

		requestAnimationFrame(() => {
			const rect = windowRef.current?.getBoundingClientRect();
			if (rect?.width && rect?.height) {
				sizeRef.current = { width: rect.width, height: rect.height };
				setSize({ width: rect.width, height: rect.height });
			}
			clampToViewport(sizeRef.current, DEFAULT_POSITION);
		});
	}, [clampToViewport]);

	// Responsive initialization: minimize on mobile by default
	useEffect(() => {
		if (hasInitializedResponsive.current) return;
		hasInitializedResponsive.current = true;

		const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		if (isMobile) {
			setIsMinimized(true);
		}

		// Set initial icon position to bottom-right corner
		const initialIconX = window.innerWidth - ICON_SIZE - VIEWPORT_PADDING;
		const initialIconY = window.innerHeight - ICON_SIZE - VIEWPORT_PADDING;
		iconPositionRef.current = { x: initialIconX, y: initialIconY };
		setIconPosition({ x: initialIconX, y: initialIconY });
	}, []);

	useEffect(() => {
		const handleResize = () => {
			clampToViewport();
			clampIconToViewport();
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [clampToViewport, clampIconToViewport]);

	useEffect(() => {
		if (!isLoaded) return undefined;
		const startTimer = window.setTimeout(() => setShowInitializing(true), 200);
		const endTimer = window.setTimeout(() => setShowInitializing(false), 2000);
		return () => {
			window.clearTimeout(startTimer);
			window.clearTimeout(endTimer);
		};
	}, [isLoaded]);


	const setResizeHandleRef = useCallback(
		(node) => {
			if (resizeCleanupRef.current) {
				resizeCleanupRef.current();
				resizeCleanupRef.current = null;
			}

			resizeRef.current = node;
			if (!node) return;

			const onPointerDown = (event) => {
				if (event.button !== 0) return;
				event.preventDefault();
				const handle = event.currentTarget;
				handle.setPointerCapture(event.pointerId);

				const start = {
					x: event.clientX,
					y: event.clientY,
					width: sizeRef.current.width,
					height: sizeRef.current.height,
				};

				const onPointerMove = (moveEvent) => {
					const nextWidth = Math.max(
						MIN_WIDTH,
						start.width + (moveEvent.clientX - start.x)
					);
					const nextHeight = Math.max(
						MIN_HEIGHT,
						start.height + (moveEvent.clientY - start.y)
					);

					sizeRef.current = { width: nextWidth, height: nextHeight };
					setSize({ width: nextWidth, height: nextHeight });
				};

				const onPointerUp = () => {
					if (handle?.releasePointerCapture) {
						handle.releasePointerCapture(event.pointerId);
					}
					window.removeEventListener('pointermove', onPointerMove);
					window.removeEventListener('pointerup', onPointerUp);
					clampToViewport();
				};

				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('pointerup', onPointerUp);
			};

			node.addEventListener('pointerdown', onPointerDown);
			resizeCleanupRef.current = () => {
				node.removeEventListener('pointerdown', onPointerDown);
			};
		},
		[clampToViewport]
	);

	useEffect(() => {
		return () => {
			if (resizeCleanupRef.current) {
				resizeCleanupRef.current();
			}
		};
	}, []);

	const handleHeaderPointerDown = (event) => {
		if (event.button !== 0) return;
		if (event.target.closest('button')) return;
		event.preventDefault();

		const start = {
			x: event.clientX,
			y: event.clientY,
			startX: position.x,
			startY: position.y,
		};

		const onPointerMove = (moveEvent) => {
			const nextX = start.startX + (moveEvent.clientX - start.x);
			const nextY = start.startY + (moveEvent.clientY - start.y);
			setPosition({ x: nextX, y: nextY });
		};

		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			clampToViewport();
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	};

	const streamAssistantResponse = useCallback(
		async ({
			userMessage,
			includeUserMessage = true,
			intent,
			modeOverride,
			resetMessages = false,
		}) => {
			if (!userMessage?.content?.trim() || isLoading) return;
			if (includeUserMessage && rateLimitUntil && Date.now() < rateLimitUntil) {
				setMessages((prev) => [
					...prev,
					{
						role: 'assistant',
						content: `Rate limit exceeded. Please try again in ${rateLimitRemaining || 1}s.`,
					},
				]);
				return;
			}

			if (resetMessages) {
				setMessages([]);
			}

			if (includeUserMessage) {
				setMessages((prev) => [...prev, userMessage]);
				setInput('');
			}

			setIsLoading(true);

			try {
				const response = await fetch('/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						messages: [userMessage],
						mode: modeOverride ?? mode,
						intent,
					}),
				});

				if (!response.ok) {
					let errorMessage = 'Failed to get response';
					try {
						const errorData = await response.json();
						if (errorData?.error) {
							errorMessage = errorData.error;
						}
					} catch {
						// Ignore JSON parse errors for error responses
					}

					if (response.status === 429) {
						const retryAfterHeader = response.headers.get('retry-after');
						const retryAfterSeconds = Math.max(
							1,
							Number.parseInt(retryAfterHeader, 10) || 30
						);
						setRateLimitUntil(Date.now() + retryAfterSeconds * 1000);
						setMessages((prev) => [
							...prev,
							{
								role: 'assistant',
								content: `Rate limit exceeded. Please try again in ${retryAfterSeconds}s.`,
							},
						]);
						return;
					}

					throw new Error(errorMessage);
				}

				// Add empty assistant message for streaming
				setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);
							if (data === '[DONE]') continue;

							try {
								const parsed = JSON.parse(data);
								if (parsed.content) {
									setMessages((prev) => {
										const updated = [...prev];
										const lastIdx = updated.length - 1;
										if (updated[lastIdx]?.role === 'assistant') {
											updated[lastIdx] = {
												...updated[lastIdx],
												content: updated[lastIdx].content + parsed.content,
											};
										}
										return updated;
									});
								}
								if (parsed.error) {
									const detail = parsed.detail ? ` (${parsed.detail})` : '';
									console.error(`Stream error: ${parsed.error}${detail}`);
								}
							} catch {
								// Ignore JSON parse errors for incomplete chunks
							}
						}
					}
				}
			} catch (error) {
				console.error('Chat error:', error);
				setMessages((prev) => [
					...prev,
					{
						role: 'assistant',
						content: error?.message || 'Sorry, I encountered an error. Please try again.',
					},
				]);
			} finally {
				setIsLoading(false);
			}
		},
		[isLoading, mode, rateLimitRemaining, rateLimitUntil]
	);

	const requestGreeting = useCallback(
		({ force = false, reset = false } = {}) => {
			if (isLoading) return;
			if (hasRequestedGreeting.current && !force) return;
			hasRequestedGreeting.current = true;
			const userMessage = { role: 'user', content: buildGreetingContext() };
			streamAssistantResponse({
				userMessage,
				includeUserMessage: false,
				intent: 'greeting',
				modeOverride: 'casual',
				resetMessages: reset,
			});
		},
		[isLoading, streamAssistantResponse]
	);

	useEffect(() => {
		if (!isLoaded || showInitializing) return;
		if (messages.length > 0) return;
		requestGreeting();
	}, [isLoaded, messages.length, requestGreeting, showInitializing]);

	const handleSend = () => {
		if (!input.trim() || isLoading) return;
		const userMessage = { role: 'user', content: input.trim() };
		streamAssistantResponse({ userMessage });
	};

	const handleClear = () => {
		setInput('');
		hasRequestedGreeting.current = false;
		requestGreeting({ force: true, reset: true });
	};

	const handleMinimize = () => {
		setIsMinimized(true);
	};

	const handleIconPointerDown = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();

		const start = {
			x: event.clientX,
			y: event.clientY,
			startX: iconPosition.x,
			startY: iconPosition.y,
		};
		let hasMoved = false;

		const onPointerMove = (moveEvent) => {
			const dx = moveEvent.clientX - start.x;
			const dy = moveEvent.clientY - start.y;
			if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
				hasMoved = true;
			}
			const nextX = start.startX + dx;
			const nextY = start.startY + dy;
			iconPositionRef.current = { x: nextX, y: nextY };
			setIconPosition({ x: nextX, y: nextY });
		};

		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			clampIconToViewport();

			// If no significant movement, treat as click and restore window
			if (!hasMoved) {
				setIsMinimized(false);
			}
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};

	if (!isMounted) {
		return null;
	}

	if (isMinimized) {
		return (
			<div className="fixed inset-0 z-50 pointer-events-none">
				<button
					type="button"
					className={`chat-minimized-tile pointer-events-auto transition-opacity duration-500 ${
						isLoaded ? 'opacity-100' : 'opacity-0'
					}`}
					style={{
						position: 'absolute',
						left: iconPosition.x,
						top: iconPosition.y,
					}}
					onPointerDown={handleIconPointerDown}
					aria-label="Open chat window"
				>
					<div className="chat-minimized-tile__header">
						<div className="chat-minimized-tile__icon">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={MINIMIZED_ICON_SRC}
								alt=""
								draggable={false}
							/>
						</div>
						<span className="chat-minimized-tile__title">Chat</span>
						<div className="chat-minimized-tile__indicator" />
					</div>
					<div className="chat-minimized-tile__body">
						<span className="chat-minimized-tile__meta">Click to open</span>
						<span className="chat-minimized-tile__hint">Drag to move</span>
					</div>
				</button>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 pointer-events-none">
			<Window
				resizable
				resizeRef={setResizeHandleRef}
				className={`app-window pointer-events-auto transition-opacity transition-transform duration-700 animate-maximize-in ${
					isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
				}`}
				ref={windowRef}
				style={{
					position: 'absolute',
					left: position.x,
					top: position.y,
					width: size.width,
					height: size.height,
				}}
			>
				<WindowHeader
					active="true"
					className="app-window__header flex items-center justify-between"
					onPointerDown={handleHeaderPointerDown}
				>
					<span>{showInitializing ? '' : 'Chat'}</span>
					<Button
						active={null}
						className="app-window__close"
						onClick={handleMinimize}
					>
						<span className="close-icon" />
					</Button>
				</WindowHeader>
				<WindowContent className="app-window__content relative">
					{showInitializing && (
						<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/100">
							<Loader variant="inline" active />
						</div>
					)}
					<ScrollView
						shadow="true"
						className="app-window__scroll"
						ref={scrollRef}
					>
						<div className="app-window__scroll-inner">
							{!showInitializing && (
								<>
									{!isLoaded && (
										<div className="text-left flex items-center gap-2">
											<Loader variant="inline" active />
											<span className="text-xs">Loading chat...</span>
										</div>
									)}
									{isLoaded && messages.map((msg, idx) => {
										const { body, sourcesText } = splitSources(msg.content);
										const sources = parseSources(sourcesText);
										return (
											<ChatMessage
												key={idx}
												variant={msg.role === 'user' ? 'user' : 'ai'}
												content={body}
											>
												{sources.length > 0 && (
													<div className="chat-sources">
														<div className="chat-sources__header">
															<span className="chat-sources__badge">Source Log</span>
															<span className="chat-sources__count">
																{sources.length} {sources.length === 1 ? 'item' : 'items'}
															</span>
														</div>
														<ul className="chat-sources__list">
															{sources.map((source, sourceIdx) => (
																<li className="chat-sources__item" key={`${idx}-source-${sourceIdx}`}>
																	<span className="chat-sources__bullet" />
																	<div className="chat-sources__content">
																		{source.url && isSafeUrl(source.url) ? (
																			<a
																				href={source.url}
																				target="_blank"
																				rel="noreferrer"
																			>
																				{source.title}
																			</a>
																		) : (
																			<span>{source.title}</span>
																		)}
																		{source.meta && (
																			<span className="chat-sources__meta">
																				{' '}
																				{source.meta}
																			</span>
																		)}
																	</div>
																</li>
															))}
														</ul>
													</div>
												)}
												{isLoading && idx === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
													<span className="animate-pulse">...</span>
												)}
											</ChatMessage>
										);
									})}
									{isLoading && (
										<div className="text-left flex items-start gap-2">
											<span className="text-blue-900 font-[4px]">&gt;</span>
											<div className="flex items-center gap-2">
												<Loader variant="inline" active />
												<span className="text-xs">Thinking...</span>
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</ScrollView>
					<div className="app-window__input">
						<TextInput
							placeholder="Enter your question here!"
							className="w-full"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isLoading || (rateLimitUntil && Date.now() < rateLimitUntil)}
						/>
					</div>
					<div
						className="app-window__actions"
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<div className="flex flex-col px-[2px] gap-1">
							<Radio
								checked={mode === 'casual'}
								onChange={handleModeChange}
								value="casual"
								label="Casual"
								name="chat-mode"
								className="my-0"
								disabled={isLoading}
							/>
							<br />
							<Radio
								checked={mode === 'slang'}
								onChange={handleModeChange}
								value="slang"
								label="Slang"
								name="chat-mode"
								disabled={isLoading}
							/>
						</div>

						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: '4px',
							}}
						>
							<Button
								primary
								onClick={handleSend}
								disabled={isLoading || !input.trim() || (rateLimitUntil && Date.now() < rateLimitUntil)}
							>
								{isLoading
									? 'Sending...'
									: rateLimitUntil && Date.now() < rateLimitUntil
										? `Wait ${rateLimitRemaining || 1}s`
										: 'Send'}
							</Button>
							<Button onClick={handleClear} disabled={isLoading}>
								Clear
							</Button>
						</div>
					</div>
				</WindowContent>
			</Window>
		</div>
	);
}

export default ChatWindow;
