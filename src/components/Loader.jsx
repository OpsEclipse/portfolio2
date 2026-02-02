'use client';

import { useEffect, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const Loader = () => {
	const { showLoader: show } = usePortfolio();
	const [animationState, setAnimationState] = useState('loading'); // 'loading', 'expanding', 'done'

	useEffect(() => {
		if (!show) {
			setAnimationState('expanding');
			// Wait for expansion animation to finish before removing from DOM
			const timer = setTimeout(() => {
				setAnimationState('done');
			}, 500); // 800ms matches the transition duration
			return () => clearTimeout(timer);
		}
	}, [show]);

	if (animationState === 'done') return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary overflow-hidden">
			<div
				className={`relative flex items-center justify-center transition-transform duration-700 ease-in-out ${
					animationState === 'expanding' ? 'scale-[200]' : 'scale-100'
				}`}
			>
				{/* Orbit Path (Invisible container for rotation) */}
				<div className="w-16 h-16">
					{/* The Circle */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-bg rounded-full" />
				</div>
			</div>
		</div>
	);
};

export default Loader;
