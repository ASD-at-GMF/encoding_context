// Turn word finder on by default
chrome.storage.sync.set({ on: true });

// Get the active window
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
      chrome.storage.session.set({ wordDetails: message.wordDetails });
      console.log(message.wordDetails);
    } 
    else if (message.action === "toggle_word_finder") {
      toggle_word_finder();
    }
  })();
});

// Listen for keyboard shortcuts
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
  chrome.storage.sync.get("on", function (on) { // Get the current state of the word finder
    // console.log(on.on);
    var on_new = !on.on;
    chrome.storage.sync.set({ on: on_new }); // Save the new state of the word finder

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { // Query the active tab
        chrome.tabs.sendMessage( // Send a message to the content script
          tabs[0].id,
          { action: "toggle_word_finder", on: on_new },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log("Tab not ready:", chrome.runtime.lastError);
            } else {
              // console.log(response);
            }
          },
        );
      });
    } catch {
      console.log("No Tab");
    }
  });
};
