'use client';

import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.js';
import { usePortfolio } from '../context/PortfolioContext';

function SocialLinks() {
	const { isLoaded, openMusicPage } = usePortfolio();
	const linkClass =
		'flex gap-1 items-center text-text-muted hover:text-text-primary transition-all duration-300 cursor-pointer group pb-2';
	const textClass =
		'group-hover:translate-x-1 transition-transform duration-300';
	const iconClass =
		'group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300';

	return (
		<div
			className={`flex flex-col px-2 text-sm align-top transition-all duration-700 delay-200 ${
				isLoaded
					? 'opacity-100 translate-y-0'
					: 'opacity-0 translate-y-8'
			}`}
		>
			<a
				href="https://www.linkedin.com/in/sprsh/"
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
			>
				<p className={textClass}>Linkedin</p>
				<ArrowUpRight size={16} className={iconClass} />
			</a>
			<a
				href="https://github.com/OpsEclipse"
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
			>
				<p className={textClass}>Github</p>
				<ArrowUpRight size={16} className={iconClass} />
			</a>
			<a
				href="mailto:ss6shah@uwaterloo.ca"
				className={linkClass}
			>
				<p className={textClass}>Email</p>
				<ArrowUpRight size={16} className={iconClass} />
			</a>
			<a
				href="/resume.pdf"
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
			>
				<p className={textClass}>Resume</p>
				<ArrowUpRight size={16} className={iconClass} />
			</a>
			<button
				onClick={openMusicPage}
				className={linkClass}
			>
				<p className={textClass}>Music</p>
				<ArrowUpRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
			</button>
		</div>
	);
}

export default SocialLinks;
