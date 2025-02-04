document.querySelector("#go-to-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("../pages/options.html"));
  }
});

document.getElementById("hotkey").onclick = () =>
  chrome.tabs.create({
    url: "chrome://extensions/configureCommands",
  });

document
  .querySelector("#toggle-checkbox")
  .addEventListener("click", function () {
    chrome.runtime.sendMessage({
      action: "toggle_word_finder",
    });
  });

// to receive messages from service worker script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === "toggle_word_finder_option") {
      document.querySelector("#toggle-checkbox").checked =
        !document.querySelector("#toggle-checkbox").checked;
    }
  })();
});

chrome.storage.sync.get("on", function (on) {
  document.querySelector("#toggle-checkbox").checked = on.on;
});
