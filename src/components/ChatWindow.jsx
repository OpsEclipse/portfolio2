'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'react95/dist/Button/Button.mjs';
import { GroupBox } from 'react95/dist/GroupBox/GroupBox.mjs';
import { Radio } from 'react95/dist/Radio/Radio.mjs';
import { ScrollView } from 'react95/dist/ScrollView/ScrollView.mjs';
import { TextInput } from 'react95/dist/TextInput/TextInput.mjs';
import { Window } from 'react95/dist/Window/Window.mjs';
import { WindowContent } from 'react95/dist/Window/WindowContent.mjs';
import { WindowHeader } from 'react95/dist/Window/WindowHeader.mjs';
import ChatMessage from './ChatMessage';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 320;


function ChatWindow() {
	const resizeRef = useRef(null);
	const windowRef = useRef(null);
	const sizeRef = useRef({ width: 300, height: 340 });
	const [size, setSize] = useState(sizeRef.current);
	const [position, setPosition] = useState({ x: 24, y: 24 });
	const [mode, setMode] = useState('professional');
	const handleModeChange = (event) => {
		setMode(event.target.value);
	};

	useEffect(() => {
		sizeRef.current = size;
	}, [size]);

	useEffect(() => {
		const handle = resizeRef.current;
		if (!handle) return undefined;

		const onPointerDown = (event) => {
			if (event.button !== 0) return;
			event.preventDefault();

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

				setSize({ width: nextWidth, height: nextHeight });
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		};

		handle.addEventListener('pointerdown', onPointerDown);
		return () => handle.removeEventListener('pointerdown', onPointerDown);
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
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	};

	return (
		<div className="shrink-0 z-50">
			<Window
				resizable
				resizeRef={resizeRef}
				className="app-window"
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
					<span>Chat</span>
					<Button
						active={null}
						className="app-window__close"
					>
						<span className="close-icon" />
					</Button>
				</WindowHeader>
				<WindowContent className="app-window__content">
					<ScrollView
						shadow="true"
						className="app-window__scroll"
					>
						<div className="app-window__scroll-inner">
							<ChatMessage variant="ai">
								Welcome to the Sparsh Portfolio
								Navigator (v1.0). I’m running a
								high-performance RAG pipeline with
								Pinecone hybrid search and semantic
								chunking. In plain English: I’ve
								indexed Sparsh’s career into a
								searchable &apos;brain&apos; that you
								can now chat to. Ask me how this
								system works, or anything you want to
								know about Sparsh!
							</ChatMessage>
							<ChatMessage variant="user">
								yo what up?
							</ChatMessage>
							<ChatMessage variant="ai">
								yo what up?
							</ChatMessage>
						</div>
					</ScrollView>
					<div className="app-window__input">
						<TextInput
							placeholder="Enter your question here!"
							className="w-full"
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
								checked={mode === 'professional'}
								onChange={handleModeChange}
								value="professional"
								label="Professional"
								name="chat-mode"
								className=" 
								my-0"
							/>
							<br />
							<Radio
								checked={mode === 'casual'}
								onChange={handleModeChange}
								value="casual"
								label="Sparsh mode"
								name="chat-mode"
							/>
						</div>

						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: '4px',
							}}
						>
							<Button primary on>
								Send
							</Button>
							<Button>Clear</Button>
						</div>
					</div>
				</WindowContent>
			</Window>
		</div>
	);
}

export default ChatWindow;
