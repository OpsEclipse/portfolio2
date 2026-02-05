import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import VercelAnalytics from '@/components/VercelAnalytics';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Sparsh Shah | Portfolio',
	description: 'Personal portfolio of Sparsh Shah - Full Stack Developer and Systems Design Engineering student at University of Waterloo',
	icons: {
		icon: '/favicon.ico',
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<StyledComponentsRegistry>
					{children}
				</StyledComponentsRegistry>
				<VercelAnalytics />
			</body>
		</html>
	);
}
