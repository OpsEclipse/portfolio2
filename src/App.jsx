import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Moon,
	Sun,
	X,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
function App() {
	const [theme, setTheme] = useState(() => {
		const stored = localStorage.getItem('theme');
		return stored ? stored : 'light';
	});
	const [selectedImage, setSelectedImage] = useState(null);
	const [hoveredProject, setHoveredProject] = useState(null);
	const [confetti, setConfetti] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showLoader, setShowLoader] = useState(true);
	const sliderRefVaultify = useRef(null);
	const sliderRefTodo = useRef(null);
	const sliderRefstudybud = useRef(null);
	const sliderRefChat = useRef(null);
	const [canScrollLeftVaultify, setCanScrollLeftVaultify] =
		useState(false);
	const [canScrollRightVaultify, setCanScrollRightVaultify] =
		useState(true);
	const [canScrollLeftTodo, setCanScrollLeftTodo] = useState(false);
	const [canScrollRightTodo, setCanScrollRightTodo] =
		useState(true);

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

	const imagePopup = (src) => {
		setSelectedImage(src);
	};

	const closePopup = () => {
		setSelectedImage(null);
	};

	const confettiMake = () => {
		const newConfetti = [];
		const colors = [
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00',
			'#ff00ff',
			'#00ffff',
			'#ffa500',
			'#ff69b4',
		];
		const shapes = ['triangle', 'square', 'pentagon', 'hexagon'];

		for (let i = 0; i < 50; i++) {
			const angle =
				(Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.5;
			const velocity = 80 + Math.random() * 60;

			newConfetti.push({
				id: Date.now() + i,
				color: colors[
					Math.floor(Math.random() * colors.length)
				],
				shape: shapes[
					Math.floor(Math.random() * shapes.length)
				],
				velocityX: Math.cos(angle) * velocity,
				velocityY: Math.sin(angle) * velocity,
				rotation: Math.random() * 360,
				rotationSpeed: (Math.random() - 0.5) * 1080,
				size: 6 + Math.random() * 6,
			});
		}

		setConfetti(newConfetti);
		setTimeout(() => setConfetti([]), 2500);
	};

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	useEffect(() => {
		// Show loader for 1.4 seconds
		const loaderTimer = setTimeout(() => {
			setShowLoader(false);
			// Trigger animation after loader disappears
			setTimeout(() => setIsLoaded(true), 100);
		}, 1400);

		return () => clearTimeout(loaderTimer);
	}, []);

	const checkScrollButtons = () => {
		// Check Vaultify slider
		if (sliderRefVaultify.current) {
			const { scrollLeft, scrollWidth, clientWidth } =
				sliderRefVaultify.current;
			setCanScrollLeftVaultify(scrollLeft > 0);
			setCanScrollRightVaultify(
				scrollLeft < scrollWidth - clientWidth - 1
			);
		}
		// Check Todo slider
		if (sliderRefTodo.current) {
			const { scrollLeft, scrollWidth, clientWidth } =
				sliderRefTodo.current;
			setCanScrollLeftTodo(scrollLeft > 0);
			setCanScrollRightTodo(
				scrollLeft < scrollWidth - clientWidth - 1
			);
		}
	};

	useEffect(() => {
		checkScrollButtons();
		const sliderV = sliderRefVaultify.current;
		const sliderT = sliderRefTodo.current;
		if (sliderV) {
			sliderV.addEventListener('scroll', checkScrollButtons);
		}
		if (sliderT) {
			sliderT.addEventListener('scroll', checkScrollButtons);
		}
		return () => {
			if (sliderV) {
				sliderV.removeEventListener(
					'scroll',
					checkScrollButtons
				);
			}
			if (sliderT) {
				sliderT.removeEventListener(
					'scroll',
					checkScrollButtons
				);
			}
		};
	}, []);

	const scroll = (direction, sliderRef) => {
		const container = sliderRef.current;
		const scrollAmount = 200;
		if (direction === 'left') {
			container.scrollBy({
				left: -scrollAmount,
				behavior: 'smooth',
			});
		} else {
			container.scrollBy({
				left: scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	useEffect(() => {
		localStorage.setItem('theme', theme);
	}, [theme]);

	const changeTheme = () => {
		setTheme(prev => prev === 'dark' ? 'light' : 'dark');
	};

	return (
		<>
			{/* Loading Screen */}
			{showLoader && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-900">
					<img
						src="icon.png"
						alt="Loading"
						className="w-20 h-20 sm:w-24 sm:h-24 animate-pulse"
					/>
				</div>
			)}
			<div
				className={`min-h-screen p-6 sm:p-8 md:p-12 flex flex-col gap-12 sm:gap-16 md:gap-[64px] max-w-[550px] mx-auto transition-all duration-700 ${
					isLoaded
						? 'opacity-100 translate-y-0'
						: 'opacity-0 translate-y-8'
				}`}
			>
				<div
					className={`flex flex-col gap-4 sm:gap-6 transition-all duration-700 delay-100 ${
						isLoaded
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8'
					}`}
				>
					<div className="flex items-center justify-between">
						<div>
							<span
								className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-red-500 mr-2 transition-all duration-700 ease-in-out hover:rotate-45 hover:brightness-125 hover:cursor-pointer"
								onClick={changeTheme}
							></span>
							<span className="text-lg sm:text-xl font-normal leading-none">
								Sparsh Shah
							</span>
						</div>
						<div
							className="bg-transparent hover:bg-pill-bg p-1 mr-4 rounded-md cursor-pointer transition-all duration-500"
							onClick={changeTheme}
						>
							{theme === 'dark' ? (
								<Sun color="yellow" size={20} />
							) : (
								<Moon color="purple" size={20} />
							)}
						</div>
					</div>
					<div className="flex flex-col sm:flex-row justify-start gap-2 flex-wrap">
						<div className="w-fit h-fit flex gap-2 rounded-full border px-4 sm:px-5 py-2">
							<p className="text-[11px] sm:text-[12px] font-medium leading-none text-text-secondary">
								Waterloo, Canada
							</p>
						</div>
						<div className="w-fit h-fit flex gap-3 rounded-full border px-4 sm:px-5 py-2 bg-pill-bg">
							<p className="text-[11px] sm:text-[12px] font-medium leading-none text-text-secondary">
								<span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
								Seeking co-op{' '}
								<span className="text-text-muted">
									winter 2026
								</span>
							</p>
						</div>
					</div>
				</div>

				<div
					className={`flex items-center gap-8 sm:gap-6 transition-all duration-700 delay-100 ${
						isLoaded
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8'
					}`}
				>
					<a
						href="https://github.com/OpsEclipse"
						target="_blank"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="cursor-pointer hover:scale-110 transition-all duration-500"
						>
							<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
							<path d="M9 18c-4.51 2-5-2-7-2" />
						</svg>
					</a>
					<a
						href="https://www.linkedin.com/in/sprsh/"
						target="_blank"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="cursor-pointer hover:scale-110 transition-all duration-500"
						>
							<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
							<rect width="4" height="12" x="2" y="9" />
							<circle cx="4" cy="4" r="2" />
						</svg>
					</a>
					<a
						href="mailto:ss6shah@uwaterloo.ca"
						target="_blank"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="cursor-pointer hover:scale-110 transition-all duration-500"
						>
							<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
							<rect
								x="2"
								y="4"
								width="20"
								height="16"
								rx="2"
							/>
						</svg>
					</a>
				</div>
				<div
					className={`flex flex-col gap-4 sm:gap-6 transition-all duration-700 delay-200 ${
						isLoaded
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8'
					}`}
				>
					<div className="flex flex-col gap-2">
						<p className="text-[14px] sm:text-[16px] font-medium leading-none text-text-secondary">
							First-year student at the university of
							Waterloo{' '}
						</p>
						<p className="text-[14px] sm:text-[16px] font-medium leading-none text-text-muted">
							Studying Systems Design Engineering
						</p>
					</div>
					<p className="text-[11px] sm:text-[12px] font-normal text-text-muted leading-normal">
						Student @ Waterloo by trade, Full Stack Dev by
						passion. I love to build{' '}
						<span
							className="relative inline-block underline hover:cursor-pointer transition-all duration-300 decoration-wavy"
							onMouseEnter={confettiMake}
						>
							<span>cool stuff</span>
							{confetti.map((c) => (
								<span
									key={c.id}
									className="absolute pointer-events-none"
									style={{
										left: '50%',
										top: '50%',
										animation:
											'confettiExplode 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
										'--velocity-x': `${c.velocityX}px`,
										'--velocity-y': `${c.velocityY}px`,
										'--rotation': `${c.rotation}deg`,
										'--rotation-speed': `${c.rotationSpeed}deg`,
									}}
								>
									<span
										className={`inline-block shape-${c.shape}`}
										style={{
											width: `${c.size}px`,
											height: `${c.size}px`,
											backgroundColor: c.color,
										}}
									/>
								</span>
							))}
						</span>{' '}
						with technology. Feel free to{' '}
						<a
							href="mailto:sparshah@uwaterloo.ca"
							className="hover:text-primary transition-colors"
						>
							reach out
						</a>{' '}
						if you want to chat or collaborate!
					</p>
				</div>
				<div
					className={`flex flex-col gap-4 transition-all duration-700 delay-300 ${
						isLoaded
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8'
					}`}
				>
					{/* Project 1 - Vaultify */}
					<div
						className="flex flex-col gap-2"
						onMouseEnter={() =>
							setHoveredProject('vaultify')
						}
						onMouseLeave={() => setHoveredProject(null)}
					>
						<div className="flex gap-1 items-center cursor-pointer">
							<a
								href="https://github.com/OpsEclipse/vaultify-frontend"
								target="_blank"
							>
								<h2 className="text-[11px] sm:text-[12px]">
									Vaultify
								</h2>
							</a>
							<ArrowUpRight
								size={12}
								className="sm:w-[14px] sm:h-[14px]"
							/>
						</div>

						<div
							className={`overflow-hidden transition-all duration-500 ease-in-out ${
								hoveredProject === 'vaultify'
									? 'max-h-[500px] opacity-100'
									: 'max-h-0 opacity-0'
							}`}
						>
							<div className="flex flex-col gap-2">
								<p className="text-text-muted text-[11px] sm:text-[12px] leading-relaxed">
									Was too broke for Spotify premium,
									so made it myself.
								</p>
								<div className="flex gap-1 flex-wrap">
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											ExpressJS
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											ReactJS
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											MongoDB
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											AWS
										</p>
									</div>
								</div>

								{/* Horizontal Image Slider */}
								<div className="relative w-full group">
									{/* Left Button */}
									{canScrollLeftVaultify && (
										<button
											onClick={() =>
												scroll(
													'left',
													sliderRefVaultify
												)
											}
											className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll left"
										>
											<ChevronLeft size={16} />
										</button>
									)}

									{/* Scrollable Container */}
									<div
										ref={sliderRefVaultify}
										className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
										style={{
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
										}}
									>
										{imagesVaultify.map(
											(image, index) => (
												<div
													key={index}
													className="flex-shrink-0 cursor-pointer group/image"
													onClick={() =>
														imagePopup(
															image
														)
													}
												>
													<div className="relative overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
														<img
															src={
																image
															}
															alt={`Project screenshot ${
																index +
																1
															}`}
															className="w-64 h-40 object-cover group-hover/image:scale-110 transition-transform duration-500"
														/>
														<div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300"></div>
													</div>
												</div>
											)
										)}
									</div>

									{/* Right Button */}
									{canScrollRightVaultify && (
										<button
											onClick={() =>
												scroll(
													'right',
													sliderRefVaultify
												)
											}
											className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll right"
										>
											<ChevronRight size={16} />
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
					{/* Project 2 - AI-Powered Study Habit Tracker  */}
					<div
						className="flex flex-col gap-2"
						onMouseEnter={() =>
							setHoveredProject('studybuddy')
						}
						onMouseLeave={() => setHoveredProject(null)}
					>
						<div className="flex gap-1 items-center cursor-pointer">
							<a
								href="https://github.com/Ishan8840/StudyBuddy"
								target="_blank"
							>
								<h2 className="text-[11px] sm:text-[12px]">
									AI-Powered Study Habit Tracker
								</h2>
							</a>
							<ArrowUpRight
								size={12}
								className="sm:w-[14px] sm:h-[14px]"
							/>
						</div>

						<div
							className={`overflow-hidden transition-all duration-500 ease-in-out ${
								hoveredProject === 'studybuddy'
									? 'max-h-[500px] opacity-100'
									: 'max-h-0 opacity-0'
							}`}
						>
							<div className="flex flex-col gap-2">
								<p className="text-text-muted text-[11px] sm:text-[12px] leading-relaxed">
									Built an AI-driven study habit
									tracker using MediaPipe for
									real-time face and hand detection
									to monitor focus, distractions,
									and face-touching behavior
								</p>
								<div className="flex gap-1 flex-wrap">
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											FastApi
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											ReactJS
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											MongoDB
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											Redis
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											MediaPipe
										</p>
									</div>
								</div>

								{/* Horizontal Image Slider */}
								<div className="relative w-full group">
									{/* Left Button */}
									{canScrollLeftVaultify && (
										<button
											onClick={() =>
												scroll(
													'left',
													sliderRefstudybud
												)
											}
											className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll left"
										>
											<ChevronLeft size={16} />
										</button>
									)}

									{/* Scrollable Container */}
									<div
										ref={sliderRefVaultify}
										className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
										style={{
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
										}}
									>
										{imagesStudyBud.map(
											(image, index) => (
												<div
													key={index}
													className="flex-shrink-0 cursor-pointer group/image"
													onClick={() =>
														imagePopup(
															image
														)
													}
												>
													<div className="relative overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
														<img
															src={
																image
															}
															alt={`Project screenshot ${
																index +
																1
															}`}
															className="w-64 h-40 object-cover group-hover/image:scale-110 transition-transform duration-500"
														/>
														<div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300"></div>
													</div>
												</div>
											)
										)}
									</div>

									{/* Right Button */}
									{canScrollRightVaultify && (
										<button
											onClick={() =>
												scroll(
													'right',
													sliderRefstudybud
												)
											}
											className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll right"
										>
											<ChevronRight size={16} />
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
					{/* Project 3 */}
					<div
						className="flex flex-col gap-2"
						onMouseEnter={() =>
							setHoveredProject('project2')
						}
						onMouseLeave={() => setHoveredProject(null)}
					>
						<div className="flex gap-1 items-center cursor-pointer">
							<a
								href="https://to-do-react-1.onrender.com/##/login"
								target="_blank"
							>
								<h2 className="text-[11px] sm:text-[12px]">
									Global Task Manager
								</h2>
							</a>
							<ArrowUpRight
								size={12}
								className="sm:w-[14px] sm:h-[14px]"
							/>
						</div>

						<div
							className={`overflow-hidden transition-all duration-500 ease-in-out ${
								hoveredProject === 'project2'
									? 'max-h-[500px] opacity-100'
									: 'max-h-0 opacity-0'
							}`}
						>
							<div className="flex flex-col gap-2">
								<p className="text-text-muted text-[11px] sm:text-[12px] leading-relaxed">
									A globally accessible, shared task
									list where users can add, remove,
									and mark tasks aswell as a clean,
									responsive UI for usability across
									devices.
								</p>
								<div className="flex gap-1 flex-wrap">
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											ExpressJS
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											ReactJS
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											MongoDB
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											Socket.io
										</p>
									</div>
								</div>

								{/* Horizontal Image Slider */}
								<div className="relative w-full group">
									{/* Left Button */}
									{canScrollLeftTodo && (
										<button
											onClick={() =>
												scroll(
													'left',
													sliderRefTodo
												)
											}
											className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll left"
										>
											<ChevronLeft size={16} />
										</button>
									)}

									{/* Scrollable Container */}
									<div
										ref={sliderRefTodo}
										className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
										style={{
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
										}}
									>
										{imagesTodo.map(
											(image, index) => (
												<div
													key={index}
													className="flex-shrink-0 cursor-pointer group/image"
													onClick={() =>
														imagePopup(
															image
														)
													}
												>
													<div className="relative overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
														<img
															src={
																image
															}
															alt={`Project screenshot ${
																index +
																1
															}`}
															className="w-64 h-40 object-cover object-top group-hover/image:scale-110 transition-transform duration-500"
														/>
														<div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300"></div>
													</div>
												</div>
											)
										)}
									</div>

									{/* Right Button */}
									{canScrollRightTodo && (
										<button
											onClick={() =>
												scroll(
													'right',
													sliderRefTodo
												)
											}
											className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll right"
										>
											<ChevronRight size={16} />
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Project 4 - chatKey  */}
					<div
						className="flex flex-col gap-2"
						onMouseEnter={() =>
							setHoveredProject('chatKey')
						}
						onMouseLeave={() => setHoveredProject(null)}
					>
						<div className="flex gap-1 items-center cursor-pointer">
							<a
								href="https://github.com/OpsEclipse/ChatKey"
								target="_blank"
							>
								<h2 className="text-[11px] sm:text-[12px]">
									ChatKey
								</h2>
							</a>
							<ArrowUpRight
								size={12}
								className="sm:w-[14px] sm:h-[14px]"
							/>
						</div>

						<div
							className={`overflow-hidden transition-all duration-500 ease-in-out ${
								hoveredProject === 'chatKey'
									? 'max-h-[500px] opacity-100'
									: 'max-h-0 opacity-0'
							}`}
						>
							<div className="flex flex-col gap-2">
								<p className="text-text-muted text-[11px] sm:text-[12px] leading-relaxed">
									Built a lightweight cross-platform
									messaging application using React
									Native, supporting iOS and Android
									with seamless native performance
								</p>
								<div className="flex gap-1 flex-wrap">
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											React native
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											Expo
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											Firebase Auth
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											Firestore
										</p>
									</div>
									<div className="w-fit h-fit flex gap-2 rounded-full border px-2 py-1.5">
										<p className="text-[9px] sm:text-[10px] font-medium leading-none text-text-muted">
											NativeWind
										</p>
									</div>
								</div>

								{/* Horizontal Image Slider */}
								<div className="relative w-full group">
									{/* Left Button */}
									{canScrollLeftVaultify && (
										<button
											onClick={() =>
												scroll(
													'left',
													sliderRefstudybud
												)
											}
											className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll left"
										>
											<ChevronLeft size={16} />
										</button>
									)}

									{/* Scrollable Container */}
									<div
										ref={sliderRefChat}
										className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
										style={{
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
										}}
									>
										{imagesChat.map(
											(image, index) => (
												<div
													key={index}
													className="flex-shrink-0 cursor-pointer group/image"
													onClick={() =>
														imagePopup(
															image
														)
													}
												>
													<div className="relative overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300">
														<img
															src={
																image
															}
															alt={`Project screenshot ${
																index +
																1
															}`}
															className="w-28 h-50 object-cover group-hover/image:scale-110 transition-transform duration-500"
														/>
														<div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300"></div>
													</div>
												</div>
											)
										)}
									</div>

									{/* Right Button */}
									{canScrollRightVaultify && (
										<button
											onClick={() =>
												scroll(
													'right',
													sliderRefChat
												)
											}
											className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											aria-label="Scroll right"
										>
											<ChevronRight size={16} />
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<style>{`
				@keyframes confettiExplode {
					0% {
						transform: translate(-50%, -50%) rotate(var(--rotation)) scale(1);
						opacity: 1;
					}
					50% {
						opacity: 1;
					}
					100% {
						transform: translate(
							calc(var(--velocity-x) - 50%), 
							calc(var(--velocity-y) - 50% + 180px)
						) rotate(calc(var(--rotation) + var(--rotation-speed))) scale(0.5);
						opacity: 0;
					}
				}
				
				.shape-triangle {
					clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
				}
				
				.shape-square {
					/* Square is default */
				}
				
				.shape-pentagon {
					clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
				}
				
				.shape-hexagon {
					clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
				}

				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				
				@keyframes fade-in {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				
				@keyframes scale-in {
					from {
						transform: scale(0.9);
						opacity: 0;
					}
					to {
						transform: scale(1);
						opacity: 1;
					}
				}
				
				.animate-fade-in {
					animation: fade-in 0.2s ease-out;
				}
				
				.animate-scale-in {
					animation: scale-in 0.3s ease-out;
				}
			`}</style>
			</div>
			{/* Image Popup Modal */}
			{selectedImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in"
					onClick={closePopup}
				>
					<div
						className="relative w-full h-full flex items-center justify-center animate-scale-in"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={closePopup}
							className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
							aria-label="Close"
						>
							<X size={32} />
						</button>
						<img
							src={selectedImage}
							alt="Full size project screenshot"
							className="w-full h-full object-contain"
						/>
					</div>
				</div>
			)}
		</>
	);
}

export default App;