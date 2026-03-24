chrome.action.onClicked.addListener((tab) => {
  if (tab.id && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_VOICE_UI" }).catch((error) => {
      console.log("Error sending message to tab. Script might not be loaded yet.", error);
    });
  }
});
