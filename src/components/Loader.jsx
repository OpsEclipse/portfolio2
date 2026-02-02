'use client';

import { useEffect, useState } from 'react';
import { Hourglass } from 'react95/dist/Hourglass/Hourglass.mjs';
import { usePortfolio } from '../context/PortfolioContext';

const Loader = ({ variant = 'fullscreen', active = true, text = 'Loading...' }) => {
	const { showLoader: show } = usePortfolio();
	const [animationState, setAnimationState] = useState('loading'); // 'loading', 'done'
	const isFullscreen = variant === 'fullscreen';
	const shouldRender = isFullscreen ? show : active;

	useEffect(() => {
		if (!isFullscreen) return undefined;
		if (show) {
			setAnimationState('loading');
			return undefined;
		}
		if (!show) {
			setAnimationState('done');
			return undefined;
		}
	}, [isFullscreen, show]);

	if (!shouldRender || (isFullscreen && animationState === 'done')) return null;

	if (!isFullscreen) {
		return (
			<Hourglass
				size={14}
				style={{ margin: 0 }}
				aria-label="Loading"
			/>
		);
	}

	return (
		<div className="fixed inset-0 z-[100] bg-text-primary flex items-center justify-center">
			<div className="loader-wave text-white text-sm tracking-[0.25em] font-semibold">
				{Array.from(text).map((char, idx) => (
					<span
						key={`${char}-${idx}`}
						style={{ animationDelay: `${idx * 0.08}s` }}
					>
						{char === ' ' ? '\u00A0' : char}
					</span>
				))}
			</div>
		</div>
	);
};

export default Loader;
