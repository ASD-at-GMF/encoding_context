const template = `
  <div>
  <span>
  </span>
  <br>
  <span>
  </span>
  </div>
`;
var classifications = [];
var extensionOptions = {
  // Default options
  highlight_style: [],
  hightlight_color: "#ffecb3",
  label_color: "#ff6c6c",
};

// Clear all words from the page
function clearWords() {
  var instance = new Mark(document);
  instance.unmark(); // Remove all highlights from the page

  var tooltips = document.getElementsByClassName("tooltiptext");
  while (tooltips[0]) {
    tooltips[0].parentNode.removeChild(tooltips[0]); // Remove all tooltips
  }
}

function findWords(words) {
  const highlightStyles = extensionOptions.highlight_style || [];
  const highlightColor = extensionOptions.hightlight_color || "#ffecb3";
  var instance = new Mark(document);
  instance.mark([...words.keys()], {
    // Mark each word in the words Map
    className: `encon-highlight ${highlightStyles.join(" ")}`,
    each: function (element) {
      element.style.backgroundColor = highlightColor; // Set the background color of the element

      // Calculate contrasting color for text
      const rgb = hexToRgb(highlightColor);
      const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
      const textColor = brightness > 128 ? "#000000" : "#ffffff";

      element.style.color = textColor;
    },
  });

  let marks = document.querySelectorAll("mark.encon-highlight");

  // Store a reference to each tooltip by word
  let tooltipMap = new Map();

  marks.forEach((mark) => {
    // For each mark, create a tooltip
    let word = mark.textContent.trim().toLowerCase();

    if (!tooltipMap.has(word)) {
      // If the tooltip doesn't exist, create it
      let tooltip = document.createElement("div");
      tooltip.classList.add("tooltiptext");
      tooltip.innerHTML = `
        <strong>${word}</strong><br>
        ${words.get(word)?.definition || "No definition found"}<br>
        ${
          words.get(word)?.classifications
            ? words
                .get(word)
                .classifications.map(
                  (classification) =>
                    `<span class="classification">${classification}</span>`,
                )
                .join(" ")
            : ""
        }
        <br>
        <button class="open-sidepanel-button">Open Sidepanel</button>
      `;

      tooltip.style.position = "absolute";
      tooltip.style.backgroundColor = "rgba(21, 66, 138, 1)";
      tooltip.style.color = "white";
      tooltip.style.padding = "5px 10px";
      tooltip.style.borderRadius = "5px";
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.2s ease-in-out";
      tooltip.style.pointerEvents = "auto";
      tooltip.style.whiteSpace = "normal";
      tooltip.style.maxWidth = "300px";
      tooltip.style.zIndex = "1000";

      document.body.appendChild(tooltip);
      tooltipMap.set(word, tooltip);
    }

    let tooltip = tooltipMap.get(word);
    let hideTimer;

    const showTooltip = () => {
      // Show the tooltip
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";

      const rect = mark.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      let left =
        rect.left + window.scrollX + (rect.width - tooltipRect.width) / 2;
      let top = rect.top + window.scrollY - tooltipRect.height - 5;

      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (left < 0) {
        left = 10;
      }
      if (top < 0) {
        top = rect.bottom + window.scrollY + 5;
        tooltip.classList.add("below");
      } else {
        tooltip.classList.remove("below");
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;

      resetHideTimer();
    };

    const resetHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };

    const hideTooltip = () => {
      hideTimer = setTimeout(() => {
        if (!tooltip.matches(":hover") && !mark.matches(":hover")) {
          tooltip.style.visibility = "hidden";
          tooltip.style.opacity = "0";
          tooltip.style.transition = "opacity 0.2s ease-in-out";
          tooltip.style.pointerEvents = "auto";
          tooltip.style.whiteSpace = "normal";
          tooltip.style.maxWidth = "300px"; // Set a max width to avoid too wide tooltips
          tooltip.style.zIndex = "1000";

          document.body.appendChild(tooltip); // Append tooltip to body

          const sidePanelButton = tooltip.querySelector('.open-sidepanel-button');

          sidePanelButton.addEventListener('click', function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: word,
              wordDetails: words.get(word),
            });
          });

          // On click of word open its context in the side_panel
          mark.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: word,
              wordDetails: words.get(word),
            });
          });

          // Show tooltip and adjust position
          mark.addEventListener("mouseenter", () => {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";

            const rect = mark.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            let left =
              rect.left + window.scrollX + (rect.width - tooltipRect.width) / 2;
            let top = rect.top + window.scrollY - tooltipRect.height - 5; // Above the word

            // Prevent tooltip from overflowing screen
            if (left + tooltipRect.width > window.innerWidth) {
              left = window.innerWidth - tooltipRect.width - 10;
            }
            if (left < 0) {
              left = 10;
            }
            if (top < 0) {
              top = rect.bottom + window.scrollY + 5; // Move below the word
              tooltip.classList.add("below");
            } else {
              tooltip.classList.remove("below");
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
          });

            // Allow clicking on the tooltip to open the side panel - not sure why not working
            tooltip.addEventListener("click", function () {
              chrome.runtime.sendMessage({
                action: "open_side_panel",
                word: word,
                wordDetails: words.get(word),
              });
            });


          // Prevent tooltip from disappearing when hovering over it
          tooltip.addEventListener("mouseenter", () => {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";
          });


          // Hide tooltip when the mouse leaves both the word and the tooltip
          mark.addEventListener("mouseleave", () => {
            setTimeout(() => {
              if (!tooltip.matches(":hover") && !mark.matches(":hover")) {
                tooltip.style.visibility = "hidden";
                tooltip.style.opacity = "0";
              }
            }, 1000); // Small delay to allow hovering to the tooltip
          });
        }
      }, 1000);
    };

    mark.addEventListener("mouseenter", showTooltip);
    mark.addEventListener("mouseleave", hideTooltip);
    tooltip.addEventListener("mouseenter", resetHideTimer);
    tooltip.addEventListener("mouseleave", hideTooltip);

    tooltip
      .querySelector(".open-sidepanel-button")
      .addEventListener("click", function () {
        chrome.runtime.sendMessage({
          action: "open_side_panel",
          word: word,
          wordDetails: words.get(word),
        });
      });

    mark.addEventListener("click", () => {
      showTooltip();
      hideTooltip();
    });
  });
}

var on = false;
// Main function to toggle the word finder
function main(on) {
  // console.log(on);
  if (on === true) {
    on = true;
    findWords(words);
  } else {
    on = false;
    clearWords();
  }
  return true;
}

// Helper function to convert hex to RGB
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

// Updates the highlight color on the page
function updateHighlightColors(highlightColor) {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches; // Get the current color scheme

  const rgb = hexToRgb(highlightColor); // Convert highlight color to RGB for opacity calculations
  if (!rgb) return; // Stop if invalid color

  const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b); // Adjust text color based on highlight color brightness
  const textColor = brightness > 128 ? "#000000" : "#ffffff";

  document.documentElement.style.setProperty(
    "--highlight-color",
    highlightColor,
  ); // Create CSS variable style
  document.documentElement.style.setProperty(
    "--highlight-text-color",
    textColor,
  );

  // Create or update a stylesheet with the new colors
  let style = document.getElementById("encon-dynamic-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "encon-dynamic-style";
    document.head.appendChild(style);
  }

  style.textContent = `
    mark.encon-highlight {
      background-color: ${highlightColor} !important;
      color: ${textColor} !important;
    }
  `;

  // Force refresh of all marks with the new color
  const marks = document.querySelectorAll("mark.encon-highlight");
  marks.forEach((mark) => {
    mark.style.backgroundColor = highlightColor;
    mark.style.color = textColor;
  });

  // Store the color in our local options
  extensionOptions.hightlight_color = highlightColor;
}

// Updates the label color on the page
function updateLabelColors(labelColor) {
  // Calculate contrast text color
  const rgb = hexToRgb(labelColor);
  if (!rgb) return; // Stop if invalid color

  const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
  const textColor = brightness > 128 ? "#000000" : "#ffffff";

  document.documentElement.style.setProperty("--label-color", labelColor); // Set CSS variable for future elements

  // Set text color variable
  document.documentElement.style.setProperty("--label-text-color", textColor);

  // Create or update a stylesheet with the new colors
  let style = document.getElementById("encon-dynamic-labels-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "encon-dynamic-labels-style";
    document.head.appendChild(style);
  }

  style.textContent = `
    .classification, span.chip {
      background-color: ${labelColor} !important;
      color: ${textColor} !important;
    }
  `;

  // Update existing classification spans
  const classificationSpans = document.querySelectorAll(
    ".classification, span.chip",
  );
  console.log(`Updating ${classificationSpans.length} classification spans`);

  classificationSpans.forEach((span) => {
    span.style.backgroundColor = labelColor;
    span.style.color = textColor;
  });

  // Store the color in our local options
  extensionOptions.label_color = labelColor;
}

// Message listener for extension events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle_word_finder") {
    main(message.on);
    sendResponse("Toggled Word Finder");
  } else if (message.action === "update_highlight_color") {
    updateHighlightColors(message.color);
    sendResponse("Updated highlight color");
  } else if (message.action === "update_label_color") {
    updateLabelColors(message.color);
    sendResponse("Updated label color");
    return true; // Required for async response
  }
});

// Initialize color scheme listener
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    // Use our cached options instead of retrieving from storage again
    if (extensionOptions.hightlight_color) {
      updateHighlightColors(extensionOptions.hightlight_color);
    }
  });

// Main listener for option changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.options?.newValue) {
      // Check if options have changed
      const newOptions = changes.options.newValue;

      if (newOptions.classifications) {
        // Check if classifications have changed
        classifications = newOptions.classifications;
      }

      if (newOptions.highlight_style) {
        // Check if highlight styles have changed
        extensionOptions.highlight_style = newOptions.highlight_style;
      }

      // Update highlight color if it's changed
      if (
        newOptions.hightlight_color &&
        newOptions.hightlight_color !== extensionOptions.hightlight_color
      ) {
        updateHighlightColors(newOptions.hightlight_color);
      }

      // Update label color if it's changed
      if (
        newOptions.label_color &&
        newOptions.label_color !== extensionOptions.label_color
      ) {
        updateLabelColors(newOptions.label_color);
      }
    }
  }
});

// Function to initialize the extension
function initializeExtension() {
  // Get options and extension state from storage
  chrome.storage.sync.get(["options", "on"], function (data) {
    console.log("Initializing extension with data:", data);

    // Initialize options
    if (data.options) {
      // Store options in memory
      if (data.options.highlight_style) {
        extensionOptions.highlight_style = data.options.highlight_style;
      }

      if (data.options.classifications) {
        classifications = data.options.classifications;
      }

      if (data.options.hightlight_color) {
        extensionOptions.hightlight_color = data.options.hightlight_color;
        updateHighlightColors(data.options.hightlight_color);
      }

      if (data.options.label_color) {
        extensionOptions.label_color = data.options.label_color;
        updateLabelColors(data.options.label_color);
      }
    }

    // Toggle the word finder based on the current state
    if (data.on !== undefined) {
      main(data.on);
    }
  });
}

const wordlists = [];
var words = new Map();

async function initializeData() {
  const data = await chrome.storage.local.get("data");
  Object.assign(wordlists, data.data.lists);
  wordlists.forEach((wordlist) => {
    wordlist.terms.forEach((term) => {
      worddata = {};
      worddata.definition = term.short_definition;
      worddata.classifications = [wordlist.listName];
      worddata.adllink = term.wiki_link;
      words.set(term.term, worddata);
    });
  });
}

// Run initialization
initializeData();
initializeExtension();
