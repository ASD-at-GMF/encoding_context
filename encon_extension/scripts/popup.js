document.querySelector("#go-to-options").addEventListener("click", function () { // When the "Go to options" button is clicked
  if (chrome.runtime.openOptionsPage) { 
    chrome.runtime.openOptionsPage(); 
  } else {
    window.open(chrome.runtime.getURL("../pages/options.html")); // Open the options page in a new tab
  }
});

document.getElementById("hotkey").onclick = () => //When click the 'shortcuts' button go to chrome extension settings page
  chrome.tabs.create({
    url: "chrome://extensions/configureCommands",
  });

document.querySelector("#toggle-checkbox").addEventListener("click", function () {
    chrome.runtime.sendMessage({
      action: "toggle_word_finder",
    });
  });

// to receive messages from service worker script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "toggle_word_finder_option") {
      document.querySelector("#toggle-checkbox").checked = !document.querySelector("#toggle-checkbox").checked;
    }
  })();
});

chrome.storage.sync.get("on", function (on) { // Get the current state of the word finder
  document.querySelector("#toggle-checkbox").checked = on.on;
});