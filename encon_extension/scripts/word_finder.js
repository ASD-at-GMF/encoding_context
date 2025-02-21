// Scans through all words in words.js and marks them

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

async function getWords() {
  try {
    const url = "https://context.tools/words";

    const data = {
      text: document.body.textContent,
      classifications: classifications,
    };
    // console.log(classifications);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", dataType: "jonp" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    // console.log(json.words);
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
  for (let [key, value] of words.entries()) {
    instance.mark(key);
    let marks = document.querySelectorAll("mark");
    if (marks) {
      marks.forEach((mark) => {
        if (mark.classList == "") {
          mark.classList.add("encon_tooltip");
          mark.tabIndex = "0";

          // Create the tooltip dynamically and append to body
          let tooltip = document.createElement("div");
          tooltip.classList.add("tooltiptext");
          tooltip.innerHTML = `
            <strong>${mark.textContent}</strong><br>
            ${value.definition}<br>
            ${value.classifications.map(classification => `<span class="classification">${classification}</span>`).join(" ")}
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
          tooltip.style.maxWidth = "300px"; // Set a max width to avoid too wide tooltips
          tooltip.style.zIndex = "1000";

          document.body.appendChild(tooltip); // Append tooltip to body

          const sidePanelButton = tooltip.querySelector('.open-sidepanel-button');

          sidePanelButton.addEventListener('click', function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: key,
              wordDetails: value,
            });
          });

          // On click of word open its context in the side_panel
          mark.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: key,
              wordDetails: value,
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
                word: key,
                wordDetails: value,
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
      });
    }
  }
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
  // console.log(on);
  if (on === true) {
    getWords();
  } else {
    clearWords();
  }
  return true;
}
