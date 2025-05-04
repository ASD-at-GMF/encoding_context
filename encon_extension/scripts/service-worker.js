// Turn word finder on by default
chrome.storage.sync.set({ on: true, dynamic: false });

// Get the active window
let windowId;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
});

// Main service worker listening script
// Receives messages from popup, options, and word_finder scripts.
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "open_side_panel") {     // Open side panel from word_finder
      chrome.sidePanel.open({ windowId: windowId, tabId: sender.tab.id });
      chrome.storage.session.set({ lastWord: message.word });
      chrome.storage.session.set({ wordDetails: message.wordDetails });
      console.log(message.wordDetails);
    } else if (message.action === "toggle_word_finder") {     // Toggles from popup
      toggle_word_finder();
    }else if (message.action === "toggle_dynamic_highlight") {
      toggle_dynamic_highlight();
    } else if (message.action === "reload_data") {     // Reload data from options
      console.log("Reload");
      get_data();
    }
  })();
});

// Listen for keyboard shortcuts. Right now just the word finder toggle.
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

// Code to handle when the word finder is toggled.
// Needs to set it in sync storage, and turn off word_finders.
const toggle_word_finder = () => {
  chrome.storage.sync.get("on", function (on) {
    // Get the current state of the word finder
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

// Code to handle when the dynamic highlighting is toggled.
// Needs to set it in sync storage, and turn off dynamic highlighting.
const toggle_dynamic_highlight = () => {
  chrome.storage.sync.get("dynamic", function (dynamic) {
    // Get the current state of the dynamic highlight
    var dynamic_new = !dynamic.dynamic;
    chrome.storage.sync.set({ dynamic: dynamic_new }); // Save the new state of the word finder

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Query the active tab
        chrome.tabs.sendMessage(
            // Send a message to the content script
            tabs[0].id,
            { action: "toggle_dynamic_highlight", dynamic: dynamic_new },
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

// Get API words data on chrome extension startup.
chrome.runtime.onStartup.addListener(async function () {
  console.log("open");
  await get_data();
});

// Get API words data on chrome extension install.
chrome.runtime.onInstalled.addListener(async function () {
  console.log("Installed");
  await get_data();
});

// Function to get word data from API.
// This does the important API call, and then fills the local chrome storage with correct information.
async function get_data() {
  var classifications = [];
  chrome.storage.sync.get(["options", "on"], async function (options) {
    if (options.options && options.options.classifications) {
      classifications = options.options.classifications;
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

      let list_colors = new Map();

      for (let i = 0; i < data.tags.length; i++) {
        if (data.colors[i] !== "") {
          let color = {};
          color.highlight = data.colors[i];
          const rgb = hexToRgb(color.highlight );
          const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
          color.text = brightness > 128 ? "#000000" : "#ffffff";
          list_colors.set(data.tags[i], color);
        }
      }
      data.list_colors = Object.fromEntries(list_colors);

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

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); // regex to match hex color
  return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
}

// Helper function to calculate color brightness
function calculateBrightness(r, g, b) {
  return Math.round((r * 299 + g * 587 + b * 114) / 1000);
}