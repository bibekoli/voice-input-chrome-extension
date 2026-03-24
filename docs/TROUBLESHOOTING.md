# Troubleshooting

## Icon does not change

Steps:

1. Open `chrome://extensions`.
2. Click `Reload` on this extension.
3. Refresh the active webpage.
4. Click extension icon to open and close the panel.

Expected:

- Open panel -> `ON` icon
- Closed panel -> `OFF` icon

## `Unchecked runtime.lastError: Icon invalid`

Cause:

- Action icon files are invalid size/type for runtime `chrome.action.setIcon`.

Fix:

- Use valid action icon sizes (`16`, `24`, `32`) and correct PNG assets.
- Verify the files exist under `icons/`.

## Microphone keeps asking for permission

Cause:

- Speech recognition currently runs in page/content-script context, so permission behavior follows browser site-level security rules.

Notes:

- Extensions cannot silently bypass microphone consent.
- To reduce repeated prompts, move audio capture/recognition into an extension-owned context (for example, offscreen document) and forward transcripts to content scripts.

## No text insertion

Checks:

1. Ensure a text field is focused while dictating.
2. Test with plain `input` or `textarea` first.
3. Confirm the page allows script-driven input events.

## Speech API not supported

Cause:

- Browser does not support `SpeechRecognition` / `webkitSpeechRecognition`.

Fix:

- Use a compatible Chromium-based browser with speech recognition support enabled.
