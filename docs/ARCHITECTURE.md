# Architecture

## Overview

The extension has two runtime parts:

- Background service worker (`background.js`)
- Content script UI (`content.js` + `content.css`)

## Background Service Worker

Responsibilities:

- Handles extension action icon clicks.
- Sends `TOGGLE_VOICE_UI` message to the active tab.
- Updates toolbar icon (`ON`/`OFF`) based on panel visibility.
- Receives `VOICE_UI_STATE_CHANGED` messages from content script.

## Content Script

Responsibilities:

- Injects floating voice control panel into each page.
- Handles panel show/hide and drag behavior.
- Uses Web Speech API for speech recognition.
- Inserts recognized text into currently focused editable element.
- Notifies background script when visibility changes.

## Message Flow

1. User clicks extension icon.
2. `background.js` sends `TOGGLE_VOICE_UI` to content script.
3. Content script toggles panel visibility and replies with `isVisible`.
4. Background updates action icon.
5. Content script also emits `VOICE_UI_STATE_CHANGED` for sync.

## Current Speech Model

Speech recognition is done in page context via:

- `window.SpeechRecognition`
- `window.webkitSpeechRecognition`

Because recognition runs in content script/page context, microphone consent is still controlled by browser privacy model.
