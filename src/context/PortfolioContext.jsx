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
	const [showLoader, setShowLoader] = useState(true);
	const [hoveredProject, setHoveredProject] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const [selector, setSelector] = useState('projects');

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	useEffect(() => {
		const loaderTimer = setTimeout(() => {
			setShowLoader(false);
			setTimeout(() => setIsLoaded(true), 100);
		}, 1400);

		return () => clearTimeout(loaderTimer);
	}, []);

	const changeTheme = useCallback(() => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	const changeSelector = useCallback((value) => {
		setSelector(value);
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
		selector,
		changeSelector,
	}), [
		theme,
		changeTheme,
		isLoaded,
		showLoader,
		hoveredProject,
		selectedImage,
		imagePopup,
		closePopup,
		selector,
		changeSelector,
	]);

	return (
		<PortfolioContext.Provider value={value}>
			{children}
		</PortfolioContext.Provider>
	);
}
