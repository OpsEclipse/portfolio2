'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from 'styled-components';
import { theme, GlobalStyles } from '@/react95Theme';

const blockedProps = new Set([
	'active',
	'fullWidth',
	'primary',
	'shadow',
	'square',
]);

const shouldForwardProp = (prop) => !blockedProps.has(prop);

export default function StyledComponentsRegistry({ children }) {
	const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

	useServerInsertedHTML(() => {
		const styles = styledComponentsStyleSheet.getStyleElement();
		styledComponentsStyleSheet.instance.clearTag();
		return <>{styles}</>;
	});

	if (typeof window !== 'undefined') {
		return (
			<StyleSheetManager shouldForwardProp={shouldForwardProp}>
				<ThemeProvider theme={theme}>
					<GlobalStyles />
					{children}
				</ThemeProvider>
			</StyleSheetManager>
		);
	}

	return (
		<StyleSheetManager
			shouldForwardProp={shouldForwardProp}
			sheet={styledComponentsStyleSheet.instance}
		>
			<ThemeProvider theme={theme}>
				<GlobalStyles />
				{children}
			</ThemeProvider>
		</StyleSheetManager>
	);
}
