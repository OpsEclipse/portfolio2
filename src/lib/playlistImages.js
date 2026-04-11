import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set([
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.gif',
]);

function normalizeFolderName(folderName) {
	if (typeof folderName !== 'string') {
		throw new RangeError('unsafe folderName');
	}

	const segments = folderName.split(/[\\/]+/).filter(Boolean);

	if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) {
		throw new RangeError('unsafe folderName');
	}

	return segments.join('/');
}

export async function getPlaylistImagePaths({
	publicDir = path.join(process.cwd(), 'public'),
	folderName = 'playlist-images',
} = {}) {
	const normalizedFolderName = normalizeFolderName(folderName);
	const folderPath = path.join(publicDir, normalizedFolderName);

	try {
		const entries = await readdir(folderPath, { withFileTypes: true });

		return entries
			.filter((entry) => entry.isFile())
			.map((entry) => entry.name)
			.filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
			.sort((left, right) => left.localeCompare(right))
			.map((name) => `/${normalizedFolderName}/${name}`);
	} catch (error) {
		if (error && error.code === 'ENOENT') {
			return [];
		}

		throw error;
	}
}
