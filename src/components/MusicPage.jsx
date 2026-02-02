'use client';

import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.js';
import { usePortfolio } from '../context/PortfolioContext';

function TrackItem({ track, index }) {
	return (
		<a
			href={track.spotifyUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center gap-4 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors duration-200 -mx-2 px-2 rounded-lg"
		>
			<span className="text-xs text-[var(--color-text-muted)] w-5 text-right font-mono">
				{String(index + 1).padStart(2, '0')}
			</span>
			<img
				src={track.image}
				alt={track.album}
				className="w-10 h-10 rounded object-cover"
				loading="lazy"
			/>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
					{track.name}
				</p>
				<p className="text-xs text-[var(--color-text-muted)] truncate">
					{track.artist}
				</p>
			</div>
		</a>
	);
}

function MusicPage() {
	const { musicPageOpen, closeMusicPage, musicData, musicLoading } =
		usePortfolio();

	if (!musicPageOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-[var(--color-bg)] overflow-y-auto animate-fade-in">
			<div className="max-w-lg mx-auto px-6 py-8">
				<button
					onClick={closeMusicPage}
					className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-8 group"
				>
					<ArrowLeft
						size={16}
						className="group-hover:-translate-x-1 transition-transform"
					/>
					<span>Back</span>
				</button>

				<header className="mb-8">
					<h1 className="text-xl font-medium text-[var(--color-text-primary)] mb-1">
						Music
					</h1>
					<p className="text-sm text-[var(--color-text-muted)]">
						All-time favorites
					</p>
				</header>

				{musicLoading ? (
					<div className="flex justify-center py-12">
						<div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
					</div>
				) : (
					<div className="space-y-0">
						{musicData?.top_tracks?.map((track, index) => (
							<TrackItem
								key={track.id}
								track={track}
								index={index}
							/>
						))}

						{!musicData?.top_tracks?.length && (
							<p className="text-center text-[var(--color-text-muted)] py-12">
								No music data yet
							</p>
						)}
					</div>
				)}

				{musicData?.last_updated && (
					<p className="text-xs text-[var(--color-text-muted)] text-center mt-8">
						Updated {new Date(musicData.last_updated).toLocaleDateString()}
					</p>
				)}
			</div>
		</div>
	);
}

export default MusicPage;
