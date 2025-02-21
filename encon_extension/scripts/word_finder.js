// Scans through all words in words.js and marks them

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
      headers: { "Content-Type": "application/json", dataType: "jonp" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();

    var words = new Map(Object.entries(json.words));
    findWords(words);
  } catch (error) {
    console.error("Error: " + error.message);
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
  var instance = new Mark(document);
  instance.mark([...words.keys()]); // Ensure all words are marked

  let marks = document.querySelectorAll("mark");

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
}

chrome.storage.sync.get("options", function (options) {
  classifications = options.options.classifications;
});

chrome.storage.sync.get("on", function (on) {
  main(on.on);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  main(message.on);
  sendResponse("Toggled Word Finder");
});

function main(on) {
  if (on === true) {
    getWords();
  } else {
    clearWords();
  }
  return true;
}
