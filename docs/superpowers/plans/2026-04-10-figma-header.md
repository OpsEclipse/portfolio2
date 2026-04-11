# Figma Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Figma header bar with exact playlist images stored in `public/playlist-images` and render that image strip dynamically from the folder contents.

**Architecture:** Convert `app/page.jsx` back into a server entry so it can read playlist image filenames from disk, then pass those URLs into a client page shell that keeps the existing portfolio behavior. Add one focused `PlaylistHeader` component for the new UI and one small filesystem helper with Node tests for the risky folder-reading logic.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, Node `fs/promises`, Node test runner

---

## File Structure

- Modify: `app/page.jsx`
  Purpose: server entry point that loads playlist image URLs and passes them to the client shell
- Create: `src/components/PortfolioPage.jsx`
  Purpose: new client component that contains the current page UI and provider usage
- Create: `src/components/PlaylistHeader.jsx`
  Purpose: render the hard-coded `Sparsh Shah` and `18` plus the overlapping playlist image strip
- Create: `src/lib/playlistImages.js`
  Purpose: read `public/playlist-images`, filter valid image files, sort them, and return public URLs
- Create: `src/lib/playlistImages.test.js`
  Purpose: verify the helper only returns valid image paths and fails safely
- Create: `public/playlist-images/playlist-01.png`
- Create: `public/playlist-images/playlist-02.png`
- Create: `public/playlist-images/playlist-03.png`
- Create: `public/playlist-images/playlist-04.png`
- Create: `public/playlist-images/playlist-05.png`
  Purpose: exact Figma playlist images, saved in stable sorted order
- Modify: `package.json`
  Purpose: add a `test` script for the Node test runner

### Task 1: Add a tested playlist image helper

**Files:**
- Create: `src/lib/playlistImages.js`
- Create: `src/lib/playlistImages.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/playlistImages.test.js`
Expected: FAIL with `Cannot find module` or `does not provide an export named 'getPlaylistImagePaths'`

- [ ] **Step 3: Write the minimal implementation**

```js
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set([
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.gif',
]);

export async function getPlaylistImagePaths({
	publicDir = path.join(process.cwd(), 'public'),
	folderName = 'playlist-images',
} = {}) {
	const folderPath = path.join(publicDir, folderName);

	try {
		const entries = await readdir(folderPath, { withFileTypes: true });

		return entries
			.filter((entry) => entry.isFile())
			.map((entry) => entry.name)
			.filter((name) =>
				IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
			)
			.sort((left, right) => left.localeCompare(right))
			.map((name) => `/${folderName}/${name}`);
	} catch (error) {
		if (error && error.code === 'ENOENT') {
			return [];
		}

		throw error;
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/playlistImages.test.js`
Expected: PASS with `2 tests`

- [ ] **Step 5: Add the package script and commit**

```json
{
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint",
		"test": "node --test src/lib/**/*.test.js"
	}
}
```

```bash
git add package.json src/lib/playlistImages.js src/lib/playlistImages.test.js
git commit -m "test: add playlist image helper"
```

### Task 2: Split the page into server and client parts

**Files:**
- Modify: `app/page.jsx`
- Create: `src/components/PortfolioPage.jsx`

- [ ] **Step 1: Write the failing integration shape**

```js
// app/page.jsx
import { getPlaylistImagePaths } from '@/lib/playlistImages';
import PortfolioPage from '@/components/PortfolioPage';

export default async function Home() {
	const playlistImages = await getPlaylistImagePaths();

	return <PortfolioPage playlistImages={playlistImages} />;
}
```

```js
// src/components/PortfolioPage.jsx
'use client';

export default function PortfolioPage() {
	throw new Error('PortfolioPage not implemented');
}
```

- [ ] **Step 2: Run build to verify it fails for the right reason**

Run: `npm run build`
Expected: FAIL because `PortfolioPage` throws `not implemented`

- [ ] **Step 3: Move the current client page into the new component**

```jsx
'use client';

import Header from '@/components/Header';
import About from '@/components/About';
import SocialLinks from '@/components/SocialLinks';
import ProjectCard from '@/components/ProjectCard';
import Loader from '@/components/Loader';
import ImageModal from '@/components/ImageModal';
import ChatWindow from '@/components/ChatWindow';
import PlaylistHeader from '@/components/PlaylistHeader';
import {
	PortfolioProvider,
	usePortfolio,
} from '@/context/PortfolioContext';

const imagesVaultify = [
	'https://github.com/OpsEclipse/vaultify-frontend/raw/main/public/vaultify.png',
	'vaultify2.png',
	'vaultify3.png',
];
const imagesTodo = ['todo1.png', 'todo2.png', 'todo3.png'];
const imagesStudyBud = [
	'studdybud2.png',
	'studdybud3.png',
	'studdybud4.png',
	'studdybud5.png',
	'studdybud6.png',
];
const imagesChat = [
	'https://github.com/OpsEclipse/ChatKey/blob/main/assets/loginPage.png?raw=true',
	'https://github.com/OpsEclipse/ChatKey/blob/main/assets/chatPage.png?raw=true',
	'https://github.com/OpsEclipse/ChatKey/blob/main/assets/overviewPage.png?raw=true',
	'https://github.com/OpsEclipse/ChatKey/blob/main/assets/friendsPage.png?raw=true',
];

const projects = [
	{
		id: 'vaultify',
		title: 'Vaultify',
		repoLink: 'https://github.com/OpsEclipse/vaultify-frontend',
		demoLink: 'https://www.youtube.com/watch?v=mCXQQ_RFFjw',
		description:
			'Was too broke for Spotify premium, so made it myself.',
		tags: ['ExpressJS', 'ReactJS', 'MongoDB', 'AWS'],
		images: imagesVaultify,
	},
	{
		id: 'studybuddy',
		title: 'AI-Powered Study Habit Tracker',
		repoLink: 'https://github.com/Ishan8840/StudyBuddy',
		demoLink: 'https://www.youtube.com/watch?v=swpcKQaMguY',
		description:
			'Built an AI-driven study habit tracker using MediaPipe for real-time face and hand detection to monitor focus, distractions, and face-touching behavior',
		tags: ['FastApi', 'ReactJS', 'MongoDB', 'Redis', 'MediaPipe'],
		images: imagesStudyBud,
	},
	{
		id: 'project2',
		title: 'Global Task Manager',
		repoLink: 'https://to-do-react-1.onrender.com/##/login',
		demoLink: '',
		description:
			'A globally accessible, shared task list where users can add, remove, and mark tasks aswell as a clean, responsive UI for usability across devices.',
		tags: ['ExpressJS', 'ReactJS', 'MongoDB', 'Socket.io'],
		images: imagesTodo,
		imageClassName: 'w-64 h-40 object-top',
	},
	{
		id: 'chatKey',
		title: 'ChatKey',
		repoLink: 'https://github.com/OpsEclipse/ChatKey',
		demoLink: 'https://www.youtube.com/shorts/DRrh8PuZnFk',
		description:
			'Built a lightweight cross-platform messaging application using React Native, supporting iOS and Android with seamless native performance',
		tags: [
			'React native',
			'Expo',
			'Firebase Auth',
			'Firestore',
			'NativeWind',
		],
		images: imagesChat,
		imageClassName: 'w-28 h-50',
	},
];

const allImages = [
	...imagesVaultify,
	...imagesTodo,
	...imagesStudyBud,
	...imagesChat,
];

function PortfolioContent({ playlistImages }) {
	const { isLoaded, hoveredProject, setHoveredProject } =
		usePortfolio();

	return (
		<>
			<Loader />
			<div className="min-h-screen px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12">
				<div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
					<div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:items-start md:gap-8">
						<div
							className={`flex max-w-[550px] flex-col gap-12 transition-all duration-700 sm:gap-16 md:mx-0 md:gap-[64px] ${
								isLoaded
									? 'opacity-100 translate-y-0'
									: 'opacity-0 translate-y-8'
							}`}
						>
							<PlaylistHeader playlistImages={playlistImages} />
							<Header />
							<About />
							<div
								className={`flex flex-col gap-4 transition-all duration-700 delay-300 ${
									isLoaded
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-8'
								}`}
							>
								{projects.map((project) => (
									<ProjectCard
										key={project.id}
										title={project.title}
										description={project.description}
										tags={project.tags}
										items={project.images}
										repoLink={project.repoLink}
										demoLink={project.demoLink}
										isHovered={hoveredProject === project.id}
										onHover={() =>
											setHoveredProject(project.id)
										}
										onLeave={() => setHoveredProject(null)}
										imageClassName={
											project.imageClassName || 'w-64 h-40'
										}
									/>
								))}
							</div>
						</div>
						<SocialLinks />
					</div>
					<ChatWindow />
				</div>
				<ImageModal />
				<div style={{ display: 'none' }}>
					{[...playlistImages, ...allImages].map((src, index) => (
						<img key={index} src={src} alt="preload" />
					))}
				</div>
			</div>
		</>
	);
}

export default function PortfolioPage({ playlistImages }) {
	return (
		<PortfolioProvider>
			<PortfolioContent playlistImages={playlistImages} />
		</PortfolioProvider>
	);
}
```

- [ ] **Step 4: Run build to verify the server/client split passes**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/page.jsx src/components/PortfolioPage.jsx
git commit -m "refactor: split portfolio page for server data"
```

### Task 3: Build the Figma header UI and add the exact assets

**Files:**
- Create: `src/components/PlaylistHeader.jsx`
- Create: `public/playlist-images/playlist-01.png`
- Create: `public/playlist-images/playlist-02.png`
- Create: `public/playlist-images/playlist-03.png`
- Create: `public/playlist-images/playlist-04.png`
- Create: `public/playlist-images/playlist-05.png`
- Modify: `src/components/PortfolioPage.jsx`

- [ ] **Step 1: Export the exact Figma images into the public folder**

Run:

```bash
mkdir -p public/playlist-images
```

Save the Figma image nodes into these exact paths, in left-to-right order:

- `public/playlist-images/playlist-01.png`
- `public/playlist-images/playlist-02.png`
- `public/playlist-images/playlist-03.png`
- `public/playlist-images/playlist-04.png`
- `public/playlist-images/playlist-05.png`

- [ ] **Step 2: Write the header component**

```jsx
import Image from 'next/image';

export default function PlaylistHeader({ playlistImages = [] }) {
	return (
		<div className="flex w-full max-w-[640px] items-start justify-between gap-6">
			<div className="flex items-start">
				<h1 className="text-[3rem] font-semibold leading-none tracking-[-0.06em] text-black">
					Sparsh Shah
				</h1>
				<span className="ml-1 text-2xl font-semibold leading-none text-black/40">
					18
				</span>
			</div>

			<div className="flex min-h-12 shrink-0 items-center pl-7">
				{playlistImages.map((src, index) => (
					<div
						key={src}
						className={index === 0 ? 'relative h-12 w-12' : 'relative -ml-5 h-12 w-12'}
					>
						<Image
							src={src}
							alt=""
							fill
							sizes="48px"
							className="rounded-[10px] object-cover"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
```

- [ ] **Step 3: Place the header above the existing content**

```jsx
<div
	className={`flex max-w-[550px] flex-col gap-12 sm:gap-16 md:gap-[64px] ${
		isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
	}`}
>
	<PlaylistHeader playlistImages={playlistImages} />
	<Header />
	<About />
</div>
```

- [ ] **Step 4: Run tests and build**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PlaylistHeader.jsx src/components/PortfolioPage.jsx public/playlist-images
git commit -m "feat: add figma playlist header"
```

### Task 4: Final polish and verification

**Files:**
- Modify: `src/components/PlaylistHeader.jsx`
- Modify: `src/components/PortfolioPage.jsx`

- [ ] **Step 1: Adjust spacing until the rendered header matches the Figma screenshot closely**

Check:

- name size and weight
- `18` placement
- image overlap amount
- desktop width and height
- mobile overflow behavior

- [ ] **Step 2: Run final verification**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/PlaylistHeader.jsx src/components/PortfolioPage.jsx
git commit -m "style: tune figma header spacing"
```
