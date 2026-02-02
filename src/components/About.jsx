'use client';

import confetti from 'canvas-confetti';
import { usePortfolio } from '../context/PortfolioContext';

const About = () => {
	const { isLoaded } = usePortfolio();

	const triggerConfetti = () => {
		const x = 0.5;
		const y = -0.1;

		confetti({
			particleCount: 500,
			spread: 1000,
			origin: { x, y },
			colors: [
				'#ff0000',
				'#00ff00',
				'#0000ff',
				'#ffff00',
				'#ff00ff',
				'#00ffff',
			],
			disableForReducedMotion: true,
		});
	};

	return (
		<div
			className={`flex flex-col gap-4 sm:gap-6 transition-all duration-700 delay-200 ${
				isLoaded
					? 'opacity-100 translate-y-0'
					: 'opacity-0 translate-y-8'
			}`}
		>
			<div className="flex flex-col gap-2">
				<p className="text-[14px] sm:text-[16px] font-medium leading-none text-text-secondary">
					First-year student at the university of Waterloo{' '}
				</p>
				<p className="text-[14px] sm:text-[16px] font-medium leading-none text-text-muted">
					Studying Systems Design Engineering
				</p>
			</div>
			<p className="text-[11px] sm:text-[12px] font-normal text-text-muted leading-normal">
				Student @ Waterloo by trade, Full Stack Dev by
				passion. I love to build{' '}
				<span
					className="relative inline-flex items-center gap-1 cursor-pointer group/confetti transition-all duration-300"
					onMouseEnter={triggerConfetti}
					onClick={triggerConfetti}
				>
					<span className="underline decoration-wavy decoration-accent/50 group-hover/confetti:decoration-accent transition-all hover:text-accent">
						cool stuff
					</span>
				</span>{' '}
				with technology. Feel free to{' '}
				<a
					href="mailto:ss6shah@uwaterloo.ca"
					className="hover:text-primary transition-colors"
				>
					reach out
				</a>{' '}
				if you want to chat or collaborate!
			</p>
		</div>
	);
};

export default About;
