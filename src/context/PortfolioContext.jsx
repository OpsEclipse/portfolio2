'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

import { supabase } from '../lib/supabase';

const PortfolioContext = createContext();

const DUMMY_MUSIC_DATA = {
	id: 'current_state',
	top_tracks: [
		{
			id: '1',
			name: 'Passion Fruit',
			artist: 'Drake',
			album: 'More Life',
			image: 'https://upload.wikimedia.org/wikipedia/en/2/24/Drake_-_More_Life.png',
			spotifyUrl: 'https://open.spotify.com/track/5mCPDVBb16L4XQwDdbRUpz',
		},
		{
			id: '2',
			name: 'Who Knows',
			artist: 'Daniel Caesar',
			album: 'NEVER ENOUGH',
			image: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Daniel_Caesar_-_Never_Enough.jpg',
			spotifyUrl: 'https://open.spotify.com/track/4W4fNrZYkobj539TOWsLO2',
		},
		{
			id: '3',
			name: 'Toronto 2014',
			artist: 'Daniel Caesar',
			album: 'NEVER ENOUGH',
			image: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Daniel_Caesar_-_Freudian.png',
			spotifyUrl: 'https://open.spotify.com/track/6r0EOlV0gSUhuhnxkPz45s',
		},
		{
			id: '4',
			name: 'Bake Shop',
			artist: 'Kuala',
			album: 'Bake Shop',
			image: 'https://i.scdn.co/image/ab67616d0000b273f5b5e9a4b4b5e9a4b4b5e9a',
			spotifyUrl: 'https://open.spotify.com/track/placeholder',
		},
	],
	last_updated: new Date().toISOString(),
};

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
	const [musicPageOpen, setMusicPageOpen] = useState(false);
	const [musicData, setMusicData] = useState(null);
	const [musicLoading, setMusicLoading] = useState(false);

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

	const fetchMusicData = useCallback(async () => {
		setMusicLoading(true);
		try {
			const { data, error } = await supabase
				.from('music_cache')
				.select('*')
				.eq('id', 'current_state')
				.single();

			if (error) throw error;
			if (!data?.top_tracks?.length) {
				setMusicData(DUMMY_MUSIC_DATA);
			} else {
				setMusicData(data);
			}
		} catch (err) {
			console.error('Error fetching music data, using dummy data:', err);
			setMusicData(DUMMY_MUSIC_DATA);
		} finally {
			setMusicLoading(false);
		}
	}, []);

	const openMusicPage = useCallback(() => {
		setMusicPageOpen(true);
		if (!musicData) {
			fetchMusicData();
		}
	}, [musicData, fetchMusicData]);

	const closeMusicPage = useCallback(() => {
		setMusicPageOpen(false);
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
		musicPageOpen,
		openMusicPage,
		closeMusicPage,
		musicData,
		musicLoading,
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
		musicPageOpen,
		openMusicPage,
		closeMusicPage,
		musicData,
		musicLoading,
	]);

	return (
		<PortfolioContext.Provider value={value}>
			{children}
		</PortfolioContext.Provider>
	);
}
