'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const PortfolioContext = createContext();

export function usePortfolio() {
	const context = useContext(PortfolioContext);
	if (!context) {
		throw new Error('usePortfolio must be used within a PortfolioProvider');
	}
	return context;
}

export function PortfolioProvider({ children }) {
	const [theme, setTheme] = useState(
		() => (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light') || 'light'
	);

	const [isLoaded, setIsLoaded] = useState(false);
	const [showLoader] = useState(false);
	const [hoveredProject, setHoveredProject] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	useEffect(() => {
		const raf = requestAnimationFrame(() => {
			setIsLoaded(true);
		});
		return () => cancelAnimationFrame(raf);
	}, []);

	const changeTheme = useCallback(() => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}, []);


	const imagePopup = useCallback((src) => {
		setSelectedImage(src);
	}, []);

	const closePopup = useCallback(() => {
		setSelectedImage(null);
	}, []);

	const value = useMemo(() => ({
		theme,
		changeTheme,
		isLoaded,
		showLoader,
		hoveredProject,
		setHoveredProject,
		selectedImage,
		imagePopup,
		closePopup,
	}), [
		theme,
		changeTheme,
		isLoaded,
		showLoader,
		hoveredProject,
		selectedImage,
		imagePopup,
		closePopup,
	]);

	return (
		<PortfolioContext.Provider value={value}>
			{children}
		</PortfolioContext.Provider>
	);
}
