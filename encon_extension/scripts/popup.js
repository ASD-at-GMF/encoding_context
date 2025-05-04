// Link for the Go to Options button
// Opens the chrome extension options page.
document.querySelector("#go-to-options").addEventListener("click", function () {
  // When the "Go to options" button is clicked
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("../pages/options.html")); // Open the options page in a new tab
  }
});

// Link to go to the chrome extension hotkey page
document.getElementById("hotkey").onclick = () =>
  //When click the 'shortcuts' button go to chrome extension settings page
  chrome.tabs.create({
    url: "chrome://extensions/configureCommands",
  });

// Code for the word finder toggle.
// Sends a message to the service worker to handle the rest.
document
  .querySelector("#toggle-checkbox")
  .addEventListener("click", function () {
    chrome.runtime.sendMessage({
      action: "toggle_word_finder",
    });
  });

// Code for the dynamic highlighting toggle.
// Sends a message to the service worker to handle the rest.
document
  .querySelector("#dynamic-toggle")
  .addEventListener("click", function () {
    chrome.runtime.sendMessage({
      action: "toggle_dynamic_highlight",
    });
  });

// to receive messages from service worker script
// Checks the popup options when they change elsewhere.
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "toggle_word_finder_option") {
      document.querySelector("#toggle-checkbox").checked =
        !document.querySelector("#toggle-checkbox").checked;
    }
  })();
});

// Get initial toggle info from chrome sync storage.
chrome.storage.sync.get("on", function (on) {
  // Get the current state of the word finder
  document.querySelector("#toggle-checkbox").checked = on.on;
});

// Get initial toggle info from chrome sync storage.
chrome.storage.sync.get("dynamic", function (dynamic) {
  // Get the current state of the word finder
  document.querySelector("#dynamic-toggle").checked = dynamic.dynamic;
});
