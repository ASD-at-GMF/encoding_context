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
    } else if (message.action === "toggle_word_finder") {
      toggle_word_finder();
    } else if (message.action === "reload_data") {
      get_data();
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
  chrome.storage.sync.get("on", function (on) {
    // Get the current state of the word finder
    // console.log(on.on);
    var on_new = !on.on;
    chrome.storage.sync.set({ on: on_new }); // Save the new state of the word finder

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Query the active tab
        chrome.tabs.sendMessage(
            // Send a message to the content script
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

chrome.runtime.onStartup.addListener(async function () {
  console.log("open");
  await get_data();
});

chrome.runtime.onInstalled.addListener(async function () {
  console.log("Installed");
  await get_data();
});

async function get_data() {
  var classifications = [];
  chrome.storage.sync.get(["options", "on"], async function (data) {
    if (data.options && data.options.classifications) {
      classifications = data.options.classifications;
    }
    try {
      var url = "https://context.tools/wordlist";
      if (classifications) {
        url += "?tag=" + classifications[0];
        for (let i = 1; i < classifications.length; i++) {
          url += "&tag=" + classifications[i];
        }
      }

      const response = await fetch(url, {
        // Fetch the words from the API
        method: "GET",
        headers: { "Content-Type": "application/json", dataType: "jsonp" },
      }).catch((error) => {
        console.error("Network error:", error);
        return null;
      });

      // Check if fetch was successful
      if (!response) {
        return;
      }

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      // // Check if json.words exists
      // if (!json || !json.lists) {
      //   console.error("Invalid response format");
      //   return;
      // }

      chrome.storage.local.set({ data }, () => {
        var error = chrome.runtime.lastError;
        if (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.error("Error fetching words:", error.message);
    }
  });
}
