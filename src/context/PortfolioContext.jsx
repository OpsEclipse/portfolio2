import { createContext, useContext, useEffect, useState } from 'react';

const PortfolioContext = createContext();

export const usePortfolio = () => {
	const context = useContext(PortfolioContext);
	if (!context) {
		throw new Error('usePortfolio must be used within a PortfolioProvider');
	}
	return context;
};

export const PortfolioProvider = ({ children }) => {
	// Theme State
	const [theme, setTheme] = useState(() => {
		const stored = localStorage.getItem('theme');
		return stored ? stored : 'light';
	});

	// Loading State
	const [isLoaded, setIsLoaded] = useState(false);
	const [showLoader, setShowLoader] = useState(true);

	// Project Hover State
	const [hoveredProject, setHoveredProject] = useState(null);

	// Image Modal State
	const [selectedImage, setSelectedImage] = useState(null);

    // Selector State
    const [selector, setSelector] = useState('projects');

	// Theme Effect
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	// Loader Effect
	useEffect(() => {
		// Show loader for 1.4 seconds (original logic preserved, though reduced for timing adjustment)
		// Based on recent request, the transition is faster, but initial load might still want a moment.
		// The user set transition to 200ms in Loader. Here we manage the mount/unmount logic.
		const loaderTimer = setTimeout(() => {
			setShowLoader(false);
			// Trigger animation after loader disappears
			setTimeout(() => setIsLoaded(true), 100);
		}, 1400); // Keeping original 1400ms initial wait unless user requested that changed too. 
        // NOTE: User asked for "animations done to trigger after 200ms" in Loader.jsx.
        // That was the cleanup timer. The initial display time wasn't explicitly changed, 
        // but shorter is usually better for "cooler". 
        // However, I will keep the original 1400ms for now to be safe, 
        // as the request was specifically about the *transition* timing in Loader.jsx.

		return () => clearTimeout(loaderTimer);
	}, []);

	const changeTheme = () => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	};

    const changeSelector = (selector) => {
        setSelector(selector);
    };

	const imagePopup = (src) => {
		setSelectedImage(src);
	};

	const closePopup = () => {
		setSelectedImage(null);
	};

	const value = {
		theme,
		changeTheme,
		isLoaded,
		showLoader,
		hoveredProject,
		setHoveredProject,
		selectedImage,
		imagePopup,
		closePopup,
        selector,
        changeSelector,
	};

	return (
		<PortfolioContext.Provider value={value}>
			{children}
		</PortfolioContext.Provider>
	);
};
