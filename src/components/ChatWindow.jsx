'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react95/dist/Button/Button.mjs';
import { ScrollView } from 'react95/dist/ScrollView/ScrollView.mjs';
import { Radio } from 'react95/dist/Radio/Radio.mjs';
import { TextInput } from 'react95/dist/TextInput/TextInput.mjs';
import { Window } from 'react95/dist/Window/Window.mjs';
import { WindowContent } from 'react95/dist/Window/WindowContent.mjs';
import { WindowHeader } from 'react95/dist/Window/WindowHeader.mjs';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.js';
import ChatMessage from './ChatMessage';
import Loader from './Loader';
import { usePortfolio } from '../context/PortfolioContext';
import {
	applyChatEventToMessages,
	parseSseChunk,
	shouldShowChatEmptyState,
	shouldShowChatSuggestions,
} from '../lib/chat/chatWindowState.js';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 320;
const VIEWPORT_PADDING = 12;
const DEFAULT_POSITION = { x: 700, y: 175 };
const ICON_SIZE = 56;
const MOBILE_BREAKPOINT = 640;
const DESKTOP_DOCK_BREAKPOINT = 1280;
const SOURCE_MARKER = '\n\n<<SOURCES>>\n';
const SOURCE_MARKER_ALT = '\n<<SOURCES>>\n';
const SOURCE_MARKER_END = '\n<</SOURCES>>';
const MINIMIZED_ICON_SRC =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAAEEfUpiAAAACXBIWXMAAAsSAAALEgHS3X78AAAQR0lEQVRYCQE8EMPvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AAAA/wIAAAAAAAAA/wAAAADAwMAAAgAAAAAAAAABAIAAAEBAQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICA/4CAAP8AAAAAAYAAgP8AAAAAAAAAAIAAgAEAAAAAAAAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAgACA/wAAAAAAAAAAAAAAAAIAAAAAAAAAAICAgP+AAID/AICAAP//AP+AAID/AAAAAAAAAAAAgACA/4CAgP//////AAAA/8DAwP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID///8A/4AAgP8AAAAAAAAAAAIAAAAAAAAAAIAAgP8AAAAAAAAAAAAAAAAAAAD/AAAAAAIAAAAAgICA/wAAAAB//4AAgQGAAACAAAAAAAAAAAAAAAQAAAAAAIAAAH//fwCBgQAAAIAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAACAAID/gICA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgID/AIAAAAAAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAACAgID/AIAAAACAAAAAAAAAAAAAAP//AACBgQD/AICAAAAAAACAAIABAAAAAAEAAAAAAAAAAAAAAACAgID/AIAAAAAAAAAAAAAAAAAAAACAgAAAgIAAAAAAAAAAAAAAgAAAgICAAAAAAAEAAAAAAgAAAAAAAAAAgACA/0BAQAB//38AAIAAAIAAgAAAAAAAAICAAAAAAAAAgAAAQMBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAID/gICA////////////wMDA/4CAgP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgP8AgAAAAIAAAAAAAACAAIAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AIAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACA/wCAAAAAgAAAAAAAAAAAAAAAAAAAf/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAgQGAAAAAAAAAAAAAAAAAAIAAgAAAAAAAAAAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgP8AgAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICAAH9/AAAAAAAAgYEAAACAgAAAAAAAAAAAAIAAgAAAAAABAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAID/AIAAAACAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgIAAf38AAAAAAACBgQAAAAAAAIEBgAAAAAAAAAAAAAAAAACAAIAAgICAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAgACA/4AAgAAAAAAAAAAAAIAAgAAAAAAAAAAAAAAAAAAAAAAAAICAAH9/AACBgQAAAICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAICAgABAQEAAAAAAAEBAQAAAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAgACA/4AAgADAwMAAAAAAAMDAwAAAAAAAgICAAAAAAACAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAgACAgIAAQEBAAAAAAAAAAAAAwMDAAACAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz8/AD8/PwAAAAAAf39/AAAAAACBgYEAAAAAAICAgAAAAAAAgACAAAAAAACAAIAAgICAAMBAwAAAAAAAAAAAAMDAwAAAgAAAgACAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAgACAAAAAAAAAgAAAAAAAAH9/fwAAAAAAAAAAAAAAAAAAAAAAgYGBAAAAAABAQEAAAAAAAAAAAADAwMAAAIAAAIAAgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAIAAgAAAAAAAAIAAAAAAAAB/f38AAAAAAAAAAADBwcEAwMDAAACAAACAAIAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAACAAIAAAAAAAACAAAAAgAAAgACAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOohZMrBgjdjAAAAAElFTkSuQmCC';
const CHAT_SUGGESTIONS = [
	"what's something fun to know about sparsh?",
	"what's the coolest thing sparsh has built?",
	'how does this RAG thing actually work?',
];

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
	const [viewportWidth, setViewportWidth] = useState(0);
	const [mode, setMode] = useState('casual');
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rateLimitUntil, setRateLimitUntil] = useState(null);
	const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
	const [showInitializing, setShowInitializing] = useState(true);
	const { isLoaded } = usePortfolio();
	const scrollRafRef = useRef(0);
	const sseBufferRef = useRef('');
	const [isMinimized, setIsMinimized] = useState(false);
	const [clearingIndices, setClearingIndices] = useState(new Set());
	const clearTimeoutsRef = useRef([]);
	const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
	const iconPositionRef = useRef({ x: 0, y: 0 });
	const [hasSubmittedUserMessage, setHasSubmittedUserMessage] = useState(false);
	const hasInitializedResponsive = useRef(false);
	const hasUserSetHeightRef = useRef(false);
	const isDesktopDocked = viewportWidth >= DESKTOP_DOCK_BREAKPOINT;
	const isRateLimited = Boolean(rateLimitUntil && Date.now() < rateLimitUntil);
	const showEmptyState = shouldShowChatEmptyState({
		isLoaded,
		showInitializing,
		messages,
	});
	const showSuggestions = shouldShowChatSuggestions({
		hasSubmittedUserMessage,
		messages,
	});

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
		return () => {
			clearTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
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
		setViewportWidth(window.innerWidth);

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
			setViewportWidth(window.innerWidth);
			clampToViewport();
			clampIconToViewport();
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [clampToViewport, clampIconToViewport]);

	useEffect(() => {
		if (isDesktopDocked) {
			setIsMinimized(false);
		}
	}, [isDesktopDocked]);

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

				// On first resize, capture the actual rendered height (auto-height mode)
				let initialHeight = sizeRef.current.height;
				if (!hasUserSetHeightRef.current) {
					const rect = windowRef.current?.getBoundingClientRect();
					if (rect?.height) {
						initialHeight = rect.height;
						sizeRef.current = { ...sizeRef.current, height: initialHeight };
					}
					hasUserSetHeightRef.current = true;
				}

				const start = {
					x: event.clientX,
					y: event.clientY,
					width: sizeRef.current.width,
					height: initialHeight,
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

	const handleHeaderPointerDown = useCallback((event) => {
		if (event.button !== 0) return;
		if (event.target.closest('button')) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);

		const startClientX = event.clientX;
		const startClientY = event.clientY;
		const startX = positionRef.current.x;
		const startY = positionRef.current.y;

		const onPointerMove = (moveEvent) => {
			const nextX = startX + (moveEvent.clientX - startClientX);
			const nextY = startY + (moveEvent.clientY - startClientY);
			positionRef.current = { x: nextX, y: nextY };
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
	}, [clampToViewport]);

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
				sseBufferRef.current = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const { events, remainder } = parseSseChunk(
						sseBufferRef.current,
						chunk
					);
					sseBufferRef.current = remainder;

					for (const parsed of events) {
						if (parsed.type === 'status' || parsed.type === 'content') {
							setMessages((prev) =>
								applyChatEventToMessages(prev, parsed)
							);
						}
						if (parsed.error) {
							const detail = parsed.detail ? ` (${parsed.detail})` : '';
							console.error(`Stream error: ${parsed.error}${detail}`);
						}
					}
				}
				sseBufferRef.current = '';
			} catch (error) {
				console.error('Chat error:', error);
				sseBufferRef.current = '';
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

	const handleSend = () => {
		if (!input.trim() || isLoading) return;
		const userMessage = { role: 'user', content: input.trim() };
		setHasSubmittedUserMessage(true);
		streamAssistantResponse({ userMessage });
	};

	const handleSuggestionClick = (suggestion) => {
		if (isLoading || isRateLimited) return;
		setHasSubmittedUserMessage(true);
		streamAssistantResponse({
			userMessage: { role: 'user', content: suggestion },
		});
	};

	const handleClear = () => {
		setInput('');
		if (messages.length === 0) return;

		// Cancel any in-flight clear animation
		clearTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
		clearTimeoutsRef.current = [];
		setClearingIndices(new Set());

		const STAGGER_MS = 70;
		const ANIM_DURATION_MS = 240;

		// Trigger clearing animation from bottom to top
		messages.forEach((_, i) => {
			const reverseIdx = messages.length - 1 - i;
			const t = window.setTimeout(() => {
				setClearingIndices((prev) => new Set([...prev, reverseIdx]));
			}, i * STAGGER_MS);
			clearTimeoutsRef.current.push(t);
		});

		// After animation completes, clear messages
		const totalMs = (messages.length - 1) * STAGGER_MS + ANIM_DURATION_MS + 50;
		const finalT = window.setTimeout(() => {
			setMessages([]);
			setHasSubmittedUserMessage(false);
			setClearingIndices(new Set());
			clearTimeoutsRef.current = [];
		}, totalMs);
		clearTimeoutsRef.current.push(finalT);
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
		if (isDesktopDocked) {
			return (
				<div className="w-full max-w-[380px] shrink-0 xl:sticky xl:top-8">
					<button
						type="button"
						className={`chat-minimized-tile pointer-events-auto transition-opacity duration-500 ${
							isLoaded ? 'opacity-100' : 'opacity-0'
						}`}
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
							<span className="chat-minimized-tile__hint">Ready</span>
						</div>
					</button>
				</div>
			);
		}

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

	const chatWindow = (
		<Window
			resizable={!isDesktopDocked}
			resizeRef={isDesktopDocked ? undefined : setResizeHandleRef}
			className={`app-window pointer-events-auto transition-opacity transition-transform duration-700 animate-maximize-in ${
				isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
			} ${!isDesktopDocked && !hasUserSetHeightRef.current ? 'app-window--auto-height' : ''}`}
			ref={windowRef}
			style={
				isDesktopDocked
					? {
							width: '100%',
							height: 'min(720px, calc(100vh - 96px))',
					  }
					: {
							position: 'absolute',
							left: position.x,
							top: position.y,
							width: size.width,
							...(hasUserSetHeightRef.current ? { height: size.height } : {}),
					  }
			}
		>
			<WindowHeader
				active="true"
				className="app-window__header flex items-center justify-between"
				onPointerDown={isDesktopDocked ? undefined : handleHeaderPointerDown}
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
								{showEmptyState ? (
									<div className="flex flex-1 flex-col py-6">
										<div className="flex flex-1 items-center justify-center text-center">
											<span className="text-xs text-neutral-700">
												Ask me anything about Sparsh
											</span>
										</div>
										{showSuggestions && (
											<div
												className="app-window__chat-suggestions"
												aria-label="Suggested questions"
											>
												{CHAT_SUGGESTIONS.map((suggestion) => (
													<button
														key={suggestion}
														type="button"
														className="app-window__chat-suggestion group"
														onClick={() => handleSuggestionClick(suggestion)}
														disabled={isLoading || isRateLimited}
													>
														<span className="app-window__chat-suggestion-text">
															{suggestion}
														</span>
														<ArrowUpRight
															size={16}
															className="app-window__chat-suggestion-icon"
														/>
													</button>
												))}
											</div>
										)}
									</div>
								) : (
									<>
										{isLoaded && messages.map((msg, idx) => {
											const { body, sourcesText } = splitSources(msg.content);
											const sources = parseSources(sourcesText);
											return (
												<div
													key={idx}
													className={clearingIndices.has(idx) ? 'chat-message--clearing' : undefined}
												>
												<ChatMessage
													variant={msg.role === 'user' ? 'user' : 'ai'}
													content={body}
													statusLabel={msg.role === 'assistant' ? msg.statusLabel : ''}
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
											</div>
											);
										})}
										{showSuggestions && (
											<div
												className="app-window__chat-suggestions"
												aria-label="Suggested questions"
											>
												{CHAT_SUGGESTIONS.map((suggestion) => (
													<button
														key={suggestion}
														type="button"
														className="app-window__chat-suggestion group"
														onClick={() => handleSuggestionClick(suggestion)}
														disabled={isLoading || isRateLimited}
													>
														<span className="app-window__chat-suggestion-text">
															{suggestion}
														</span>
														<ArrowUpRight
															size={16}
															className="app-window__chat-suggestion-icon"
														/>
													</button>
												))}
											</div>
										)}
										{isLoading && (
											<div className="text-left flex items-start gap-2">
												<span className="text-blue-900 font-[4px]">&gt;</span>
												<span className="thinking-shimmer text-xs font-medium">Thinking...</span>
											</div>
										)}
									</>
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
						disabled={isLoading || isRateLimited}
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
							disabled={isLoading || !input.trim() || isRateLimited}
						>
							{isLoading
								? 'Sending...'
								: isRateLimited
									? `Wait ${rateLimitRemaining || 1}s`
									: 'Send'}
						</Button>
						<Button onClick={handleClear} disabled={isLoading || clearingIndices.size > 0}>
							Clear
						</Button>
					</div>
				</div>
			</WindowContent>
		</Window>
	);

	if (isDesktopDocked) {
		return (
			<div className="w-full max-w-[380px] shrink-0 xl:sticky xl:top-8">
				{chatWindow}
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 pointer-events-none">
			{chatWindow}
		</div>
	);
}

export default ChatWindow;
