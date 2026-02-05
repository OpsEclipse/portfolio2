'use client';

import { createGlobalStyle } from 'styled-components'
import original from 'react95/dist/themes/original'

export const theme = original

export const GlobalStyles = createGlobalStyle`

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('/fonts/ms_sans_serif.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('/fonts/ms_sans_serif_bold.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'W95FA';
    src: url('/fonts/W95FA.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  .close-icon {
    position: relative;
    display: inline-block;
    width: 10px;
    height: 10px;
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
  }

  .close-icon::before,
  .close-icon::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 0;
    width: 10px;
    height: 2px;
    background: currentColor;
  }

  .close-icon::before {
    transform: rotate(45deg);
  }

  .close-icon::after {
    transform: rotate(-45deg);
  }

  .app-window .app-window__header,
  .app-window .app-window__header * {
    font-family: 'W95FA', 'ms_sans_serif', sans-serif !important;
    font-weight: 100 !important;
  }

  .app-window .app-window__content {
    height: calc(100% - 33px);
    padding: 4px 1px !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .app-window__scroll {
    flex: 1;
    background: #ffffff;
    border: 1px solid #c0c0c0;
    box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080;
    overflow: hidden;
  }

  .app-window__scroll > div {
    height: 100%;
    overflow: auto;
  }

  .app-window__scroll-inner {
    padding: 8px;
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
    font-weight: 100;
    font-size: 12px;
    line-height: 1.4;
    overflow-wrap: break-word;
    opacity: 0.85;
    letter-spacing: 0.3px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .chat-sources {
    margin-top: 8px;
    border: 1px solid #8f8f8f;
    background: linear-gradient(180deg, #fff8df 0%, #fff3c4 100%);
    box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080;
    padding: 6px 8px 8px;
    font-size: 11px;
    color: #3f2a00;
  }

  .chat-sources__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .chat-sources__badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border: 1px solid #7a5a00;
    background: #ffe08a;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-size: 9px;
  }

  .chat-sources__count {
    font-size: 10px;
    color: #6b4d00;
  }

  .chat-sources__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  .chat-sources__item {
    display: grid;
    grid-template-columns: 10px 1fr;
    gap: 6px;
    align-items: start;
  }

  .chat-sources__bullet {
    width: 8px;
    height: 8px;
    margin-top: 3px;
    border: 1px solid #7a5a00;
    background: #ffcc4d;
    box-shadow: inset 1px 1px 0 #fff6d0;
  }

  .chat-sources__content a {
    color: #2b4b9a;
    text-decoration: underline;
  }

  .chat-sources__meta {
    color: #6b7280;
  }

  .app-window__input input {
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
    font-weight: 100;
    font-size: 12px;
    line-height: 10px;
    opacity: 0.85;
    letter-spacing: 0.3px;
  }

  .app-window__input input::placeholder {
    line-height: 10px;
  }

  .app-window__input [data-testid='variant-default'] {
    padding: 1px;
    border-width: 1px;
  }

  .app-window__input [data-testid='variant-default']::before {
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    border-width: 1px;
  }

  .app-window__actions {
    display: flex;
    gap: 6px;
  }

  .app-window__actions button {
    height: 24px;
    min-height: 20px;
    padding: 0 16px;
    line-height: 10px;
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
    font-weight: 100;
    font-size: 12px;
    letter-spacing: 0.3px;
  }

  .app-window__actions label,
  .app-window__actions span {
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
    font-weight: 100;
    font-size: 11px;
    line-height: 12px;
    opacity: 0.95;
    letter-spacing: 0.3px;
  }

  .app-window__actions [role='presentation'] {
    padding: 0;
  }

  .app-window__actions [role='presentation']::before {
    display: none;
  }

  .app-window__actions label {
    margin: 0;
  }

  .app-window__close {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
  }

  .app-window__header .app-window__close {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
  }

  .app-window [data-testid='resizeHandle'] {
    bottom: 2px;
    right: 2px;
  }

`
