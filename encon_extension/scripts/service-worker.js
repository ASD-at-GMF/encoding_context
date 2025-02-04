// Turn word finder on
chrome.storage.sync.set({ on: true });

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
    } else if (message.action === "toggle_word_finder") {
      toggle_word_finder();
    }
  })();
});

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle") {
    // Send toggle to popup
    chrome.runtime
      .sendMessage({
        action: "toggle_word_finder_option",
      })
      .catch((e) => console.log());
    toggle_word_finder();
  }
});

const toggle_word_finder = () => {
  chrome.storage.sync.get("on", function (on) {
    chrome.storage.sync.set({ on: !on.on });
  });
};
