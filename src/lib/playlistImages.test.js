import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { getPlaylistImagePaths } from './playlistImages.js';

test('getPlaylistImagePaths returns sorted public paths for image files only', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'playlist-images-'));
	const playlistDir = path.join(tempRoot, 'playlist-images');

	await mkdir(playlistDir, { recursive: true });
	await writeFile(path.join(playlistDir, 'playlist-03.png'), 'a');
	await writeFile(path.join(playlistDir, 'playlist-01.jpg'), 'b');
	await writeFile(path.join(playlistDir, 'notes.txt'), 'c');

	try {
		const paths = await getPlaylistImagePaths({
			publicDir: tempRoot,
			folderName: 'playlist-images',
		});

		assert.deepEqual(paths, [
			'/playlist-images/playlist-01.jpg',
			'/playlist-images/playlist-03.png',
		]);
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});

test('getPlaylistImagePaths returns an empty array when the folder is missing', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'playlist-images-missing-'));

	try {
		const paths = await getPlaylistImagePaths({
			publicDir: tempRoot,
			folderName: 'playlist-images',
		});

		assert.deepEqual(paths, []);
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});

test('getPlaylistImagePaths normalizes folderName before building public paths', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'playlist-images-normalized-'));
	const playlistDir = path.join(tempRoot, 'playlist-images');

	await mkdir(playlistDir, { recursive: true });
	await writeFile(path.join(playlistDir, 'playlist-01.jpg'), 'a');

	try {
		const paths = await getPlaylistImagePaths({
			publicDir: tempRoot,
			folderName: 'playlist-images/',
		});

		assert.deepEqual(paths, ['/playlist-images/playlist-01.jpg']);
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});

test('getPlaylistImagePaths rejects unsafe folderName values', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'playlist-images-unsafe-'));

	try {
		for (const folderName of ['', '/', '\\', '..', 'playlist-images/..']) {
			await assert.rejects(
				getPlaylistImagePaths({
					publicDir: tempRoot,
					folderName,
				}),
				/unsafe folderName/i
			);
		}
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});
