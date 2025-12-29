import { useState } from 'react';

const About = ({ isLoaded }) => {
	const [confetti, setConfetti] = useState([]);

	const confettiMake = () => {
		const newConfetti = [];
		const colors = [
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00',
			'#ff00ff',
			'#00ffff',
			'#ffa500',
			'#ff69b4',
		];
		const shapes = ['triangle', 'square', 'pentagon', 'hexagon'];

		for (let i = 0; i < 50; i++) {
			const angle =
				(Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.5;
			const velocity = 80 + Math.random() * 60;

			newConfetti.push({
				id: Date.now() + i,
				color: colors[
					Math.floor(Math.random() * colors.length)
				],
				shape: shapes[
					Math.floor(Math.random() * shapes.length)
				],
				velocityX: Math.cos(angle) * velocity,
				velocityY: Math.sin(angle) * velocity,
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 1080,
				size: 6 + Math.random() * 6,
			});
		}

		setConfetti(newConfetti);
		setTimeout(() => setConfetti([]), 2500);
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
					First-year student at the university
					of Waterloo{' '}
				</p>
				<p className="text-[14px] sm:text-[16px] font-medium leading-none text-text-muted">
					Studying Systems Design Engineering
				</p>
			</div>
			<p className="text-[11px] sm:text-[12px] font-normal text-text-muted leading-normal">
				Student @ Waterloo by trade, Full Stack
				Dev by passion. I love to build{' '}
				<span
					className="relative inline-block underline hover:cursor-pointer transition-all duration-300 decoration-wavy"
					onMouseEnter={confettiMake}
				>
					<span>cool stuff</span>
					{confetti.map((c) => (
						<span
							key={c.id}
							className="absolute pointer-events-none"
							style={{
								left: '50%',
								top: '50%',
								animation:
									'confettiExplode 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
								'--velocity-x': `${c.velocityX}px`,
								'--velocity-y': `${c.velocityY}px`,
								'--rotation': `${c.rotation}deg`,
								'--rotation-speed': `${c.rotationSpeed}deg`,
							}}
						>
							<span
								className={`inline-block shape-${c.shape}`}
								style={{
									width: `${c.size}px`,
									height: `${c.size}px`,
									backgroundColor:
										c.color,
								}}
							/>
						</span>
					))}
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
