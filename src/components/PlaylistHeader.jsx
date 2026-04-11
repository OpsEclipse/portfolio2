'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Music2, X } from 'lucide-react';

const SPREAD_PX = 9;
const LIFT_PX = 14;
const SCALE = 1.38;
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

function MusicOverlay({ item, getSong, getArtist, onClose }) {
	const [visible, setVisible] = useState(false);
	const [contentVisible, setContentVisible] = useState(false);

	useEffect(() => {
		// Two-stage entry: overlay first, then content
		const overlayTimer = requestAnimationFrame(() => {
			setVisible(true);
		});
		const contentTimer = setTimeout(() => setContentVisible(true), 420);
		return () => {
			cancelAnimationFrame(overlayTimer);
			clearTimeout(contentTimer);
		};
	}, []);

	const handleClose = useCallback(() => {
		setContentVisible(false);
		setVisible(false);
		setTimeout(onClose, 700);
	}, [onClose]);

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'Escape') handleClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [handleClose]);

	const song = getSong(item);
	const artist = getArtist(item);
	const src = typeof item === 'string' ? item : item.src;

	return (
		<div
			className="fixed inset-0 z-[300] bg-black"
			style={{
				opacity: visible ? 1 : 0,
				transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
				pointerEvents: 'auto',
			}}
			onClick={handleClose}
			role="dialog"
			aria-modal="true"
			aria-label="Music playlist entry"
		>
			{/* Close button */}
			<button
				type="button"
				onClick={(e) => { e.stopPropagation(); handleClose(); }}
				className="absolute top-6 right-6 text-white/30 hover:text-white/70 transition-colors duration-200"
				aria-label="Close"
			>
				<X size={20} />
			</button>

			{/* Content */}
			<div
				className="absolute inset-0 flex items-center justify-center px-8"
				style={{ pointerEvents: 'none' }}
			>
				<div
					style={{
						opacity: contentVisible ? 1 : 0,
						transform: contentVisible ? 'translateY(0)' : 'translateY(18px)',
						transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
						maxWidth: '580px',
						width: '100%',
					}}
				>
					{/* Philosophy text */}
					<p
						className="text-[15px] sm:text-base leading-relaxed"
						style={{ color: 'rgba(255,255,255,0.45)' }}
					>
						To most people music is ambient, something to overcome silence.
						For me, I try to keep value in it, careful so not to over consume this
						art. Some songs move me in ways I still can&apos;t fully explain; an
						emotion so raw it can only be held in such a medium.
					</p>

					<p
						className="mt-6 text-[15px] sm:text-base leading-relaxed"
						style={{ color: 'rgba(255,255,255,0.45)' }}
					>
						Memory has a soundtrack.{' '}
						<a
							href="https://open.spotify.com/playlist/678TZAYq3HW7JImhFqkyKH?si=d5564dabea6b4fd4"
							target="_blank"
							rel="noreferrer"
							onClick={(e) => e.stopPropagation()}
							style={{
								color: 'rgba(255,255,255,0.9)',
								textDecoration: 'underline',
								textUnderlineOffset: '3px',
								pointerEvents: 'auto',
							}}
						>
							This is mine.
						</a>
					</p>

					{/* Divider */}
					<div
						className="mt-8 mb-6"
						style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
					/>

					{/* Song + Artist row */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 min-w-0">
							<div
								className="relative shrink-0 rounded-[3px] overflow-hidden"
								style={{
									width: '36px',
									height: '36px',
									border: '1px solid rgba(255,255,255,0.12)',
								}}
							>
								<Image
									src={src}
									alt={song ?? 'Playlist cover'}
									fill
									sizes="36px"
									className="object-cover"
								/>
							</div>
							<div className="min-w-0">
								{song && (
									<p
										className="text-[13px] font-medium leading-none truncate"
										style={{ color: 'rgba(255,255,255,0.85)' }}
									>
										{song}
									</p>
								)}
								{artist && (
									<p
										className="text-[12px] leading-none mt-[5px] truncate"
										style={{ color: 'rgba(255,255,255,0.35)' }}
									>
										{artist}
									</p>
								)}
							</div>
						</div>

						{song && (
							<a
								href={`https://open.spotify.com/search/${encodeURIComponent([song, artist].filter(Boolean).join(' '))}`}
								target="_blank"
								rel="noreferrer"
								onClick={(e) => e.stopPropagation()}
								aria-label={`Play ${song} on Spotify`}
								style={{ pointerEvents: 'auto', flexShrink: 0 }}
								className="flex items-center justify-center"
							>
								<div
									className="flex items-center justify-center rounded-full transition-all duration-200"
									style={{
										width: '32px',
										height: '32px',
										border: '1px solid rgba(255,255,255,0.18)',
										color: 'rgba(255,255,255,0.5)',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
										e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
										e.currentTarget.style.transform = 'scale(1.08)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
										e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
										e.currentTarget.style.transform = 'scale(1)';
									}}
								>
									<svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
											<polygon points="0,0 10,5.5 0,11" />
										</svg>
								</div>
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PlaylistHeader({ playlistImages = [] }) {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const lastHoveredRef = useRef(null);

	const hasImages = playlistImages.length > 0;
	const stripWidth = hasImages ? 40 + (playlistImages.length - 1) * 22 : 0;

	const getSrc = (item) => (typeof item === 'string' ? item : item.src);
	const getSong = (item) => (typeof item === 'object' && item !== null ? item.song : null);
	const getArtist = (item) => (typeof item === 'object' && item !== null ? item.artist : null);

	const handleEnter = (i) => {
		lastHoveredRef.current = i;
		setHoveredIndex(i);
	};
	const handleLeave = () => setHoveredIndex(null);
	const handleClick = (item) => setSelectedItem(item);
	const handleCloseOverlay = useCallback(() => setSelectedItem(null), []);

	const getImageTransform = (index) => {
		if (hoveredIndex === null) return 'translateY(0px) scale(1)';
		if (index === hoveredIndex) return `translateY(-${LIFT_PX}px) scale(${SCALE})`;
		const spread = index < hoveredIndex ? -SPREAD_PX : SPREAD_PX;
		return `translateY(0px) translateX(${spread}px) scale(1)`;
	};

	const getZIndex = (index) => {
		if (index === hoveredIndex) return 50;
		return playlistImages.length - index;
	};

	const tooltipIndex = hoveredIndex ?? lastHoveredRef.current ?? 0;
	const tooltipCenterX = tooltipIndex * 22 + 20;
	const tooltipItem = playlistImages[tooltipIndex];
	const tooltipSong = tooltipItem ? getSong(tooltipItem) : null;
	const tooltipArtist = tooltipItem ? getArtist(tooltipItem) : null;
	const showTooltip = hoveredIndex !== null && tooltipSong;

	return (
		<>
			<div className="flex w-full max-w-[640px] flex-wrap items-start justify-between gap-x-6 gap-y-4 sm:flex-nowrap sm:items-center">
				{/* Left: name + track count */}
				<div className="relative flex min-w-0 max-w-[272px] items-start pr-5">
					<h2 className="text-xl sm:text-2xl font-normal leading-none">
						Sparsh Shah
					</h2>
					<span className="absolute right-0 top-1 text-[11px] font-medium leading-none text-black/40 sm:text-[13px]">
						18
					</span>
				</div>

				{/* Right: image strip + tooltip */}
				{hasImages ? (
					<div
						className="relative shrink-0"
						style={{ width: `${stripWidth}px`, height: '40px' }}
					>
						{playlistImages.map((item, index) => {
							const src = getSrc(item);
							const song = getSong(item);
							const artist = getArtist(item);
							const isHovered = hoveredIndex === index;

							return (
								<div
									key={`${src}-${index}`}
									className="absolute top-0"
									style={{
										left: `${index * 22}px`,
										width: '40px',
										height: '40px',
										zIndex: getZIndex(index),
										transform: getImageTransform(index),
										transition: `transform 0.35s ${SPRING}, box-shadow 0.25s ${EASE_OUT}`,
										borderRadius: '4px',
										boxShadow: isHovered
											? '0 12px 28px rgba(0,0,0,0.28)'
											: '0 1px 3px rgba(0,0,0,0.06)',
										cursor: 'pointer',
									}}
									onMouseEnter={() => handleEnter(index)}
									onMouseLeave={handleLeave}
									onClick={() => handleClick(item)}
								>
									<div className="relative w-full h-full overflow-hidden rounded-[4px] border border-white bg-black/5">
										<Image
											src={src}
											alt={song ? `${song} by ${artist}` : `Playlist cover ${index + 1}`}
											fill
											sizes="48px"
											className="object-cover"
										/>
									</div>
								</div>
							);
						})}

						{/* Floating info tooltip */}
						<div
							className="absolute pointer-events-none"
							style={{
								top: '52px',
								left: `${tooltipCenterX}px`,
								transform: 'translateX(-50%)',
								zIndex: 100,
								opacity: showTooltip ? 1 : 0,
								translate: showTooltip ? '0 0' : '0 4px',
								transition: `opacity 0.2s ${EASE_OUT}, translate 0.2s ${EASE_OUT}`,
							}}
						>
							<div
								className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left"
								style={{
									background: 'var(--color-surface)',
									border: '1px solid var(--color-border)',
									boxShadow: 'var(--shadow-medium)',
								}}
							>
								<Music2
									size={10}
									style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
								/>
								<div>
									<p
										className="text-[11px] font-medium leading-none"
										style={{ color: 'var(--color-text-primary)' }}
									>
										{tooltipSong}
									</p>
									{tooltipArtist && (
										<p
											className="text-[10px] leading-none mt-[3px]"
											style={{ color: 'var(--color-text-muted)' }}
										>
											{tooltipArtist}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>

			{/* Music overlay — rendered outside the strip so it can cover the full viewport */}
			{selectedItem && (
				<MusicOverlay
					item={selectedItem}
					getSong={getSong}
					getArtist={getArtist}
					onClose={handleCloseOverlay}
				/>
			)}
		</>
	);
}
