// to find the windowId of the active tab
let windowId;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
});

// to receive messages from popup script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "open_side_panel") {
      chrome.sidePanel.open({ windowId: windowId, tabId: sender.tab.id });
      chrome.storage.session.set({ lastWord: message.word });
    }
  })();
});
