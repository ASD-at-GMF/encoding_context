// Scans through all words and marks them
const template = `
  <div>
  <span></span>
  <br>
  <span></span>
  </div>
`;

var classifications = [];

async function getWords() {
  try {
    const url = "https://context.tools/words";

    const data = {
      text: document.body.textContent,
      classifications: classifications,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", dataType: "jsonp" },
      body: JSON.stringify(data),
    }).catch(error => {
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
    const json = await response.json();

    // Check if json.words exists
    if (!json || !json.words) {
      console.error("Invalid response format");
      return;
    }

    var words = new Map(Object.entries(json.words));
    findWords(words);
  } catch (error) {
    console.error("Error fetching words:", error.message);
  }
}

function clearWords() {
  var instance = new Mark(document);
  instance.unmark();

  var tooltips = document.getElementsByClassName("tooltiptext");
  while (tooltips[0]) {
    tooltips[0].parentNode.removeChild(tooltips[0]);
  }
}

function findWords(words) {
    chrome.storage.sync.get("options", function(data) {
      const highlightStyles = data.options?.highlight_style || [];
      const highlightColor = data.options?.hightlight_color || "#ffecb3";
      
      var instance = new Mark(document);
      instance.mark([...words.keys()], {
        className: `encon-highlight ${highlightStyles.join(' ')}`,
        each: function(element) {

          element.style.backgroundColor = highlightColor;
          element.style.color = "#000000";
        }
      });

    let marks = document.querySelectorAll("mark.encon-highlight");

    // Store a reference to each tooltip by word
    let tooltipMap = new Map();

    marks.forEach((mark) => {
      let word = mark.textContent.trim();

      if (!tooltipMap.has(word)) {
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
                      `<span class="classification">${classification}</span>`
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
          }
        }, 1000);
      };

      mark.addEventListener("mouseenter", showTooltip);
      mark.addEventListener("mouseleave", hideTooltip);
      tooltip.addEventListener("mouseenter", resetHideTimer);
      tooltip.addEventListener("mouseleave", hideTooltip);

      tooltip.querySelector(".open-sidepanel-button").addEventListener("click", function () {
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
  });
}

// Initialize settings
chrome.storage.sync.get("options", function (options) {
  classifications = options.options.classifications;
  if (options.options.hightlight_color) {
    updateHighlightColors(options.options.hightlight_color);
  }
});

chrome.storage.sync.get("on", function (on) {
  main(on.on);
});

function main(on) {
  if (on === true) {
    getWords();
  } else {
    clearWords();
  }
  return true;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to calculate color brightness
function calculateBrightness(r, g, b) {
  return Math.round((r * 299 + g * 587 + b * 114) / 1000);
}

function updateHighlightColors(highlightColor) {
  // Get the current color scheme
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Convert highlight color to RGB for opacity calculations
  const rgb = hexToRgb(highlightColor);
  
  // Create CSS variable style
  document.documentElement.style.setProperty('--highlight-color', highlightColor);
  
  // Adjust text color based on highlight color brightness
  const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
  const textColor = brightness > 128 ? '#000000' : '#ffffff';
  
  document.documentElement.style.setProperty('--highlight-text-color', textColor);
  
  // Create or update a stylesheet with the new colors
  let style = document.getElementById('encon-dynamic-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'encon-dynamic-style';
    document.head.appendChild(style);
  }
  
  style.textContent = `
    mark.encon-highlight {
      background-color: ${highlightColor} !important;
      color: ${textColor} !important;
    }
  `;
}

// Function to refresh highlights with current CSS variables
function refreshHighlights() {
  document.body.classList.add('refresh-highlights');
  setTimeout(() => {
    document.body.classList.remove('refresh-highlights');
  }, 10);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle_word_finder") {
    main(message.on);
    sendResponse("Toggled Word Finder");
  } else if (message.action === "update_highlight_color") {
    // Update the CSS variables
    updateHighlightColors(message.color);
    
    // Force refresh of all marks with the new color
    const marks = document.querySelectorAll("mark.encon-highlight");
    marks.forEach(mark => {
      // Apply inline style directly to ensure update
      mark.style.backgroundColor = message.color;
      
      // Calculate contrast color for text
      const rgb = hexToRgb(message.color);
      const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
      const textColor = brightness > 128 ? '#000000' : '#ffffff';
      
      mark.style.color = textColor;
    });
    
    sendResponse("Updated highlight color");
  }
});

// Initialize color scheme listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  chrome.storage.sync.get('options', function(data) {
    if (data.options && data.options.hightlight_color) {
      updateHighlightColors(data.options.hightlight_color);
    }
  });
});

// Listen for changes in options
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.options?.newValue?.hightlight_color) {
    updateHighlightColors(changes.options.newValue.hightlight_color);
  }
});