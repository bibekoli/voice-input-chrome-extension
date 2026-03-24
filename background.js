const ICON_ON = {
  16: "icons/action-on-16.png",
  24: "icons/action-on-24.png",
  32: "icons/action-on-32.png"
};

const ICON_OFF = {
  16: "icons/action-off-16.png",
  24: "icons/action-off-24.png",
  32: "icons/action-off-32.png"
};

function setActionIcon(tabId, isOn) {
  const path = isOn ? ICON_ON : ICON_OFF;

  // Set global action icon first for reliable toolbar updates.
  chrome.action.setIcon({ path }, () => {
    if (chrome.runtime.lastError) {
      console.debug("Global icon update failed:", chrome.runtime.lastError.message);
    }
  });

  // Also set per-tab icon when tab context is available.
  if (typeof tabId === "number") {
    chrome.action.setIcon({ tabId, path }, () => {
      if (chrome.runtime.lastError) {
        console.debug("Tab-specific icon update failed:", chrome.runtime.lastError.message);
      }
    });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_VOICE_UI" });
    setActionIcon(tab.id, Boolean(response && response.isVisible));
  } catch (error) {
    console.log("Error sending message to tab. Script might not be loaded yet.", error);
  }
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action !== "VOICE_UI_STATE_CHANGED" || !sender.tab || !sender.tab.id) return;
  setActionIcon(sender.tab.id, Boolean(request.isVisible));
});
