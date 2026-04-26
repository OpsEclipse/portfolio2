import test from 'node:test';
import assert from 'node:assert/strict';

import {
	getImageModalCloseClassName,
	isPresenceImage,
} from './imageModalStyles.js';

test('isPresenceImage matches full-screen Presence screenshots only', () => {
	assert.equal(isPresenceImage('/presence/1.png'), true);
	assert.equal(isPresenceImage('http://localhost:3001/presence/2.png'), true);
	assert.equal(isPresenceImage('vaultify2.png'), false);
	assert.equal(isPresenceImage('/playlist-images/song.png'), false);
});

test('getImageModalCloseClassName uses a black close icon for Presence screenshots', () => {
	assert.match(getImageModalCloseClassName('/presence/1.png'), /text-black/);
	assert.match(
		getImageModalCloseClassName('/presence/1.png'),
		/hover:text-neutral-700/
	);
	assert.doesNotMatch(getImageModalCloseClassName('/presence/1.png'), /text-white/);
});

test('getImageModalCloseClassName keeps a white close icon for other screenshots', () => {
	assert.match(getImageModalCloseClassName('vaultify2.png'), /text-white/);
	assert.match(getImageModalCloseClassName('vaultify2.png'), /hover:text-gray-300/);
	assert.doesNotMatch(getImageModalCloseClassName('vaultify2.png'), /text-black/);
});
