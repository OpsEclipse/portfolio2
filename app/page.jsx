import { getPlaylistImagePaths } from '@/lib/playlistImages';
import PortfolioPage from '@/components/PortfolioPage';

function toTitleCase(str) {
	return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parsePlaylistFilename(filename) {
	const base = filename.replace(/\.[^.]+$/, '');
	const underscoreIdx = base.indexOf('_');
	if (underscoreIdx === -1) return { song: toTitleCase(base), artist: null };
	const songPart = base.slice(0, underscoreIdx);
	const artistPart = base.slice(underscoreIdx + 1);
	return { song: toTitleCase(songPart), artist: toTitleCase(artistPart) };
}

export default async function Home() {
	const imagePaths = await getPlaylistImagePaths();

	const playlistImages = imagePaths.map((src) => {
		const filename = src.split('/').pop();
		const { song, artist } = parsePlaylistFilename(filename);
		return { src, song, artist };
	});

	return <PortfolioPage playlistImages={playlistImages} />;
}
