import test from 'node:test';
import assert from 'node:assert/strict';

import { allProjectImages, projects } from './projects.js';

test('projects includes Presence with demo video and local screenshots', () => {
	const presence = projects.find((project) => project.id === 'presence');

	assert.deepEqual(presence, {
		id: 'presence',
		title: 'Presence',
		repoLink: null,
		demoLink: 'https://www.youtube.com/watch?v=CGa5rYss5Og',
		description: 'Agentic LinkedIn Content Engine',
		tags: ['Agentic AI', 'LinkedIn', 'Content Engine'],
		images: [
			'/presence/1.png',
			'/presence/2.png',
			'/presence/3.png',
			'/presence/4.png',
		],
	});

	assert.equal(projects[0], presence);
	assert.deepEqual(allProjectImages.slice(0, 4), presence.images);
});
