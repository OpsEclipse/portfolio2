'use client';

import Header from '@/components/Header';
import PlaylistHeader from '@/components/PlaylistHeader';
import About from '@/components/About';
import SocialLinks from '@/components/SocialLinks';
import ProjectCard from '@/components/ProjectCard';
import Loader from '@/components/Loader';
import ImageModal from '@/components/ImageModal';
import ChatWindow from '@/components/ChatWindow';
import { allProjectImages, projects } from '@/lib/projects';
import {
	PortfolioProvider,
	usePortfolio,
} from '@/context/PortfolioContext';

function PortfolioContent({ playlistImages = [] }) {
	const { isLoaded, hoveredProject, setHoveredProject } =
		usePortfolio();
	const preloadImages = [
		...allProjectImages,
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
