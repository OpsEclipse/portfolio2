'use client';

import { useState, useRef, useEffect } from 'react';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.js';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.js';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js';
import { usePortfolio } from '../context/PortfolioContext';

const ScrollButton = ({ direction, onClick, visible, icon }) => {
	if (!visible) return null;

	const Icon = icon;
	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className={`absolute ${direction === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
			aria-label={`Scroll ${direction}`}
		>
			<Icon size={16} />
		</button>
	);
};

const ProjectCard = ({
	title,
	description,
	tags,
	items,
	repoLink,
	demoLink,
	isHovered,
	onHover,
	onLeave,
	imageClassName = 'w-64 h-40',
}) => {
	const { imagePopup: onImageClick } = usePortfolio();
	const sliderRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScrollButtons = () => {
		if (sliderRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } =
				sliderRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(
				scrollLeft < scrollWidth - clientWidth - 1
			);
		}
	};

	useEffect(() => {
		checkScrollButtons();
		const slider = sliderRef.current;
		if (slider) {
			slider.addEventListener('scroll', checkScrollButtons);
		}
		return () => {
			if (slider) {
				slider.removeEventListener(
					'scroll',
					checkScrollButtons
				);
			}
		};
	}, [isHovered, items]);

	const scroll = (direction) => {
		const container = sliderRef.current;
		const scrollAmount = 200;
		if (direction === 'left') {
			container.scrollBy({
				left: -scrollAmount,
				behavior: 'smooth',
			});
		} else {
			container.scrollBy({
				left: scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	return (
		<div
			className="flex flex-col gap-2"
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
		>
			<div className="flex justify-between items-center w-full">
				<div className="flex gap-1 items-center cursor-pointer hover:underline underline-offset-2 decoration-border transition-all">
					<a
						href={repoLink}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-text-primary"
					>
						<h2 className="text-[11px] sm:text-[12px] font-medium">
							{title}
						</h2>
						<ArrowUpRight
							size={12}
							className="sm:w-[14px] sm:h-[14px] text-text-muted"
						/>
					</a>
				</div>
				{demoLink && (
					<a
						href={demoLink}
						target="_blank"
						rel="noopener noreferrer"
						className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border border-border/50 bg-pill-bg hover:bg-pill-bg/80 text-text-secondary transition-colors"
					>
						Demo Video
					</a>
				)}
			</div>

			<div
				className={`overflow-hidden transition-all duration-500 ease-in-out ${
					isHovered
						? 'max-h-[500px] opacity-100'
						: 'max-h-0 opacity-0'
				}`}
				style={{ willChange: 'max-height, opacity' }}
			>
				<div className="flex flex-col gap-2">
					<p className="text-text-muted text-[11px] sm:text-[12px] leading-relaxed">
						{description}
					</p>
					<div className="flex gap-1 flex-wrap">
						{tags.map((tag, index) => (
							<div
								key={index}
								className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5"
							>
								<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
									{tag}
								</p>
							</div>
						))}
					</div>

					<div className="relative w-full group">
						<ScrollButton
							direction="left"
							onClick={() => scroll('left')}
							visible={canScrollLeft}
							icon={ChevronLeft}
						/>

						<div
							ref={sliderRef}
							className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
							style={{
								scrollbarWidth: 'none',
								msOverflowStyle: 'none',
							}}
						>
							{items.map((image, index) => (
								<div
									key={index}
									className="flex-shrink-0 cursor-pointer group/image"
									onClick={() =>
										onImageClick(image)
									}
								>
									<div className="relative overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
										<img
											src={image}
											alt={`${title} screenshot ${
												index + 1
											}`}
											className={`object-cover group-hover/image:scale-110 transition-transform duration-500 ${imageClassName}`}
											loading="lazy"
										/>
										<div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300"></div>
									</div>
								</div>
							))}
						</div>

						<ScrollButton
							direction="right"
							onClick={() => scroll('right')}
							visible={canScrollRight}
							icon={ChevronRight}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectCard;
