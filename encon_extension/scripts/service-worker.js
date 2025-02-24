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
      chrome.storage.session.set({ wordDetails: message.wordDetails });
      console.log(message.wordDetails);
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
    // console.log(on.on);
    var on_new = !on.on;
    chrome.storage.sync.set({ on: on_new });

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
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
    // chrome.tabs.query({ active: true }, function (tabs) {
    //   chrome.tabs.sendMessage(
    //     tabs[0].id,
    //     { action: "toggle_word_finder", on: on },
    //     // function (response) {},
    //   );
    // });
  });
};
