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

chrome.storage.sync.get("options", function(data) {
  if (data.options && data.options.label_color) {
    const labelColor = data.options.label_color;
    const textColor = getContrastTextColor(labelColor);
    document.documentElement.style.setProperty('--label-color', labelColor);
    document.documentElement.style.setProperty('--label-text-color', textColor);
  }
});

function getContrastTextColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}