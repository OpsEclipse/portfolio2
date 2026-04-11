'use client';

import Header from '@/components/Header';
import PlaylistHeader from '@/components/PlaylistHeader';
import About from '@/components/About';
import SocialLinks from '@/components/SocialLinks';
import ProjectCard from '@/components/ProjectCard';
import Loader from '@/components/Loader';
import ImageModal from '@/components/ImageModal';
import ChatWindow from '@/components/ChatWindow';
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

function PortfolioContent({ playlistImages = [] }) {
	const { isLoaded, hoveredProject, setHoveredProject } =
		usePortfolio();
	const preloadImages = [
		...allImages,
		...playlistImages.map((item) => (typeof item === 'string' ? item : item.src)),
	];

	return (
		<>
			<Loader />

			<div className="min-h-screen px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12">
				<div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
					<div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:items-start md:gap-8">
						<div
							className={`flex flex-col gap-12 sm:gap-16 md:gap-[64px] max-w-[550px] mx-auto md:mx-0 transition-all duration-700 ${
								isLoaded
									? 'opacity-100 translate-y-0'
									: 'opacity-0 translate-y-8'
							}`}
						>
							<div className="flex flex-col gap-3">
								<PlaylistHeader playlistImages={playlistImages} />
								<Header showIdentity={false} />
							</div>
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
					{preloadImages.map((src, index) => (
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
