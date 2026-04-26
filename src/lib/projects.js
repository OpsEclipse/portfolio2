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

const imagesPresence = [
	'/presence/1.png',
	'/presence/2.png',
	'/presence/3.png',
	'/presence/4.png',
];

export const projects = [
	{
		id: 'presence',
		title: 'Presence',
		repoLink: null,
		demoLink: 'https://www.youtube.com/watch?v=CGa5rYss5Og',
		description: 'Agentic LinkedIn Content Engine',
		tags: ['Agentic AI', 'LinkedIn', 'Content Engine'],
		images: imagesPresence,
	},
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

export const allProjectImages = [
	...imagesPresence,
	...imagesVaultify,
	...imagesTodo,
	...imagesStudyBud,
	...imagesChat,
];
