chrome.storage.session.get("lastWord", ({ lastWord }) => { // Get the last word from storage
  updateContext(lastWord);
});

chrome.storage.session.onChanged.addListener((changes) => { // Listen for changes in storage
  const lastWordChange = changes["lastWord"];

  if (!lastWordChange) {
    return;
  }

  updateContext(lastWordChange.newValue);
});

// Update the side panel with the word's context
function updateContext(word) {
  // If the side panel was opened manually, rather than using the context menu,
  // we might not have a word to show the context for.
  if (!word) return;

  document.body.querySelector("#select-a-word").style.display = "none"; // Hide instructions.

  chrome.storage.session.get("wordDetails", ({ wordDetails }) => { // Get the word details from storage
    console.log(wordDetails);
    if (!wordDetails) { // If there are no word details, give default message and return
      document.body.querySelector("#definition-word").innerText = word;
      document.body.querySelector("#definition-text").innerText = "Unknown word!";
      document.body.querySelector("#classification-labels-container").innerHTML = "";
      document.body.querySelector("#definition-link").href = "https://extremismterms.adl.org/";
      return;
    }

    // Show word, definition, link, and classification chips.
    document.body.querySelector("#definition-word").innerText = word;
    document.body.querySelector("#definition-text").innerText = wordDetails.definition;
    document.body.querySelector("#definition-link").href = wordDetails.adlLink;

    // Add a chip for each classification.
    const classificationLabelsContainer = document.body.querySelector(
      "#classification-labels-container"
    );
    
    // Get the label color from options
    chrome.storage.sync.get("options", function(data) {
      const labelColor = data.options?.label_color || "#ff6c6c";
      // Calculate contrast text color
      const textColor = getContrastTextColor(labelColor);
      
      classificationLabelsContainer.innerHTML = wordDetails.classifications // Add a chip for each classification
        .map(
          (classification) =>
            `<span class="chip" role="tag" style="background-color: ${labelColor}; color: ${textColor};" aria-label="Classified as ${classification}">${classification}</span>`
        )
        .join("");
    });
  });
}

// Function to determine best text color based on background color
function getContrastTextColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

