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

// Clear all words from the page.
// Unmarks all words within the instance that by default is the whole document.
function clearWords(instance = new Mark(document)) {
  instance.unmark(); // Remove all highlights from the page

  var tooltips = document.getElementsByClassName("tooltiptext");
  while (tooltips[0]) {
    tooltips[0].parentNode.removeChild(tooltips[0]); // Remove all tooltips
  }
}

// Main function to find words on the page. Takes a default full page instance, and searches for words.
// It uses the previously set Word Map, and loops through it, setting all the words.
// Then, goes through all marks, and creates/sets tooltips with correct highlighting.
function findWords(words, instance = new Mark(document)) {
  const highlightStyles = extensionOptions.highlight_style || [];
  const highlightColor = extensionOptions.hightlight_color || "#ffecb3";
  let mark_array = [...words.keys()];
  const chunkSize = 500;
  for (let i = 0; i < mark_array.length; i += chunkSize) {
    const chunk = mark_array.slice(i, i + chunkSize);
    instance.mark(chunk, {
      separateWordSearch: false,
      accuracy: {
        value: "exactly",
        limiters: [
          "@",
          ",",
          ".",
          "!",
          "?",
          " ",
          "\n",
          "\t",
          "(",
          ")",
          "[",
          "]",
          "{",
          "}",
        ],
      },
      className: `encon-highlight ${highlightStyles.join(" ")}`,
      each: function (element) {
        let highlight_color =  highlightColor;
        for (let classification of words.get(element.innerHTML.toLowerCase()).classifications) {
          if (list_colors.get(classification)) {
            highlight_color = list_colors.get(classification).highlight;
            break;
          }
        }

        element.style.backgroundColor = highlight_color;

        const rgb = hexToRgb(highlight_color);
        const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
        const textColor = brightness > 128 ? "#000000" : "#ffffff";

        element.style.color = textColor;
      },
    });
  }

  let marks = document.querySelectorAll("mark.encon-highlight");

  // Store a reference to each tooltip by word
  let tooltipMap = new Map();

  marks.forEach((mark) => {
    setUpElement(mark, mark.textContent.trim().toLowerCase(), tooltipMap);
  });
  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    if (window.location.hostname !== link.hostname && words.get(link.hostname)) {
      let small_instance = new Mark(link);
      small_instance.mark(link.innerText, {
        separateWordSearch: false,
        className: `encon-highlight ${highlightStyles.join(" ")}`,
            each: function (element) {
          let classification = undefined;
          for (let classification_ of words.get(link.hostname).classifications) {
            if (list_colors.has(classification_)) {
              classification = classification_;
              break;
            }
          }

          if (classification) {
            element.style.backgroundColor = list_colors.get(classification).highlight;
            element.style.color = list_colors.get(classification).text;
          } else {
            element.style.backgroundColor = highlightColor;
            const rgb = hexToRgb(highlightColor);
            const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
            element.style.color = brightness > 128 ? "#000000" : "#ffffff";
          }
          setUpElement(link, link.hostname, tooltipMap);
          },
      });
    }
  });
}

// Takes an element and its word, as well as the updating tooltipmap.
// If it's a new word, add a new tooltip.
// Otherwise, simply add the tooltip and all the information and highlighting.
function setUpElement(element, word, tooltipMap) {
    if (!tooltipMap.has(word)) {
      // If the tooltip doesn't exist, create it
      let tooltip = document.createElement("div");
      tooltip.classList.add("tooltiptext");
      tooltip.innerHTML = `
        <strong>${words.get(word)?.term || "None"}</strong><br>`
      if (words.get(word)?.aliases) tooltip.innerHTML+= `<em>${words.get(word)?.aliases}</em><br>`;
      tooltip.innerHTML += `
        ${words.get(word)?.definition || "No definition found"}<br>
        ${
          words.get(word)?.classifications
              ? words
                  .get(word)
                  .classifications.map(
                      (classification) =>
                          `<span style="background-color: ${list_colors.get(classification)?.highlight}; color: ${list_colors.get(classification)?.text}" class="classification">${classification}</span>`,
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

    // Function on the marked word that shows the tooltip. When hovering the word, this will show.
    const showTooltip = () => {
      // Show the tooltip
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";

      const rect = element.getBoundingClientRect();
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

    // Function to keep the tooltip visible when the mouse is over it.
    const resetHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };

    // Function to make the tooltip invisilbe when the mouse is off of it.
    const hideTooltip = () => {
      hideTimer = setTimeout(() => {
        if (!tooltip.matches(":hover") && !element.matches(":hover")) {
          tooltip.style.visibility = "hidden";
          tooltip.style.opacity = "0";
          tooltip.style.transition = "opacity 0.2s ease-in-out";
          tooltip.style.pointerEvents = "auto";
          tooltip.style.whiteSpace = "normal";
          tooltip.style.maxWidth = "300px"; // Set a max width to avoid too wide tooltips
          tooltip.style.zIndex = "1000";

          document.body.appendChild(tooltip); // Append tooltip to body

          const sidePanelButton = tooltip.querySelector(
              ".open-sidepanel-button",
          );

          sidePanelButton.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: word,
              wordDetails: words.get(word),
            });
          });

          // On click of word open its context in the side_panel
          element.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: word,
              wordDetails: words.get(word),
            });
          });
        }
      }, 1000);
    };

    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
    tooltip.addEventListener("mouseenter", resetHideTimer);
    tooltip.addEventListener("mouseleave", hideTooltip);

    tooltip
        .querySelector(".open-sidepanel-button")
        .addEventListener("click", function () { // Open side panel on tooltip click
          chrome.runtime.sendMessage({
            action: "open_side_panel",
            word: word,
            wordDetails: words.get(word),
          });
        });

    element.addEventListener("click", () => {
      showTooltip();
      hideTooltip();
    });
}

let on_var = false;
let dynamic_var = false;

// Main function to toggle the word finder.
// on_var corresponds to Toggle Word finder from popup options.
// dynamic_var corresponds to similar dynamic highlighting toggle.
function main(on) {
  if (on === true) {
    on_var = true;
    findWords(words);
    if (dynamic_var) observer.observe(targetNode, config);
  } else {
    on_var = false;
    clearWords();
    observer.disconnect();
  }
  return true;
}

// Below is some code for handling the dynamic highlighting using MutationObserver.
// When mutation is detected, update the content if it is not a tooltip.

const targetNode = document;
const config = { subtree: true, childList: true };
const callback = function (mutationsList, observer) {
  observer.disconnect();
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (node.classList && !node.classList.contains("tooltiptext")) {
        clearWords(new Mark(node));
        findWords(words, new Mark(node));
      }
    }
  }
  if (dynamic_var) observer.observe(targetNode, config);
};
const observer = new MutationObserver(callback);

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

// Updates the highlight color on the page.
// Uses list_colors gotten from service worker's local storage.
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

  // Force refresh of all marks with the new color
  const marks = document.querySelectorAll("mark.encon-highlight");
  marks.forEach((mark) => {
    let flag = true;
    for (let classification of words.get(mark.innerHTML.toLowerCase()).classifications) {
      if (list_colors.get(classification)) {
        flag = false;
        break;
      }
    }
    if (flag) {
      mark.style.backgroundColor = highlightColor;
      mark.style.color = textColor;
    }
  });

  // Store the color in our local options
  extensionOptions.hightlight_color = highlightColor;
}

// Updates the label color on the page.
// Similar to highlighting, also gets info from local storage colors.
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
      background-color: ${labelColor};
      color: ${textColor};
    }
  `;

  // Update existing classification spans
  const classificationSpans = document.querySelectorAll(
    ".classification, span.chip",
  );
  console.log(`Updating ${classificationSpans.length} classification spans`);

  classificationSpans.forEach((span) => {
    if (list_colors.get(span.textContent) === undefined) {
      span.style.backgroundColor = labelColor;
      span.style.color = textColor;
    }
  });

  // Store the color in our local options
  extensionOptions.label_color = labelColor;
}

// Message listener for extension events.
// Listens to events from Service worker.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle_word_finder") {
    main(message.on);
    sendResponse("Toggled Word Finder");
  } else if (message.action === "toggle_dynamic_highlight") {
    dynamic_var = message.dynamic;
    if (dynamic_var) {
      clearWords();
      findWords(words);
    }
    observer.observe(targetNode, config);
    sendResponse("Toggled Dynamic Highlight");
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

// Function to initialize the extension.
// Looks at options data from Chrome Sync data, and sets it in word finding.
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
let words = new Map();
let list_colors = new Map();

// Function to look at Local Chrome Storage, and sets that data properly.
// Specifically, this gets the words from the words API call and list_colors.
async function initializeData() {
  let host = window.location.host.replace(/^www\./, "");
  const data = await chrome.storage.local.get("data");
  Object.assign(wordlists, data.data.lists);

  list_colors = new Map(Object.entries(data.data.list_colors));

  wordlists.forEach((wordlist) => {
    wordlist.terms.forEach((term) => {
      if (words.get(term.term.toLowerCase()) != null) {
        words.get(term.term.toLowerCase()).classifications.push(wordlist.listName);
        if (words.get(term.term.toLowerCase()).aliases) words.get(term.term.toLowerCase()).aliases.map((alias) => {
          if (words.get(alias.toLowerCase()) != null) words.get(alias.toLowerCase()).classifications.push(wordlist.listName);
        });
      } else {
        if (term.sites === "" || term.sites.split(",").includes(host)) {
          let worddata = {};
          worddata.term = term.term;
          worddata.definition = term.short_definition;
          worddata.definition_long = term.long_definition;
          worddata.classifications = [wordlist.listName];
          worddata.adlLink = term.wiki_link;
          if (term.aliases !== "")  worddata.aliases = term.aliases.toLowerCase().split();
          words.set(term.term.toLowerCase(), worddata);
          if (term.aliases != null || term.aliases !== "") {
            term.aliases
              .toLowerCase()
              .split(",")
              .map((alias) => {
                if (alias !== "") words.set(alias.trim(), worddata);
              });
          }
        }
      }
    });
  });
  main(on_var);
}

// Get initial word_finder toggle to see if it should be on.
chrome.storage.sync.get("on", function (on) { // Get the current state of the word finder
  console.log(on.on);
  on_var = on.on;
});

// Get initial dynamic highlighting toggle to see if it should be on.
chrome.storage.sync.get("dynamic", function (dynamic) { // Get the current state of the word finder
  dynamic_var = dynamic.dynamic;
});

// Run initialization; for data and options
initializeData(); // Data
initializeExtension(); // Options
