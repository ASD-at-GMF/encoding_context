chrome.storage.session.get("lastWord", ({ lastWord }) => {
  updateContext(lastWord);
});

chrome.storage.session.onChanged.addListener((changes) => {
  const lastWordChange = changes["lastWord"];

  if (!lastWordChange) {
    return;
  }

  updateContext(lastWordChange.newValue);
});

function updateContext(word) {
  // If the side panel was opened manually, rather than using the context menu,
  // we might not have a word to show the context for.
  if (!word) return;

  // Hide instructions.
  document.body.querySelector("#select-a-word").style.display = "none";

  // Show word and context.
  document.body.querySelector("#definition-word").innerText = word;
  document.body.querySelector("#definition-text").innerText =
    words.get(word.toLowerCase()) ??
    `Unknown word! Supported words: ${Object.keys(words).join(", ")}`;
}
