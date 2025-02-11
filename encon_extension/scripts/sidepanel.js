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

  const wordDetails = words.get(word.toLowerCase());


  if (!wordDetails) {
    document.body.querySelector("#definition-word").innerText = word;
    document.body.querySelector("#definition-text").innterText =
      `Unknown word! Supported words: ${Object.keys(words).join(", ")}`;
    document.body.querySelector("#classification-labels-container").innerHTML = "";
    document.body.querySelector("#definition-link").href = "https://extremismterms.adl.org/";
    return;
  }

  // Show word, definition, link, and classification chips.
  document.body.querySelector("#definition-word").innerText = word;
  document.body.querySelector("#definition-text").innerText = wordDetails.definition;
  document.body.querySelector("#definition-link").href = wordDetails.adlLink;

  // Add a chip for each classification.
  const classificationLabelsContainer = document.body.querySelector("#classification-labels-container");
  classificationLabelsContainer.innerHTML = wordDetails.classifications
    .map(classification => `<span class="chip" role="tag" aria-label="Classified as ${classification}">${classification}</span>`).join("");
}
