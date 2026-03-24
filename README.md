# Voice Input Control

Voice Input Control is a Manifest V3 browser extension that adds a floating speech-to-text panel to webpages and inserts dictated text into the currently focused field.

## Features

- Floating draggable control panel.
- Start/stop voice recognition.
- Language selection (`English (US)`, `Nepali`).
- Text insertion into `input`, `textarea`, and `contenteditable`.
- Toolbar icon state:
  - `ON` icon when the panel is open.
  - `OFF` icon when the panel is closed.

## Installation

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this project folder.

## Usage

1. Focus a text field on any webpage.
2. Click the extension icon to open the panel.
3. Click `Start Listening`.
4. Speak.
5. Click `Stop Listening` or close the panel.

## Permissions

- `activeTab` for active tab interactions.
- `scripting` for extension script behavior.
- `tabs` for tab-aware action icon switching.
- `host_permissions: <all_urls>` to run content script on pages.

Microphone access still requires user/browser consent.

## Project Structure

- `manifest.json` - extension configuration.
- `background.js` - action click handling and icon updates.
- `content.js` - UI, speech recognition, text insertion.
- `content.css` - UI styling.
- `icons/` - icon assets.
- `docs/` - architecture and troubleshooting docs.

## Docs

- `docs/ARCHITECTURE.md`
- `docs/TROUBLESHOOTING.md`

## Development Workflow

1. Make changes.
2. Reload the extension in `chrome://extensions`.
3. Refresh test page(s).
4. Verify panel open/close, dictation, and icon state behavior.
