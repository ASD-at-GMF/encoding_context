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

window.onload = function () {
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
          tooltip.innerHTML = `<strong>${mark.textContent}</strong><br>${value}`;
          tooltip.style.position = "absolute";
          tooltip.style.backgroundColor = "rgba(51, 51, 51, 1)";
          tooltip.style.color = "white";
          tooltip.style.padding = "5px 10px";
          tooltip.style.borderRadius = "5px";
          tooltip.style.visibility = "hidden";
          tooltip.style.opacity = "0";
          tooltip.style.transition = "opacity 0.2s ease-in-out";
          tooltip.style.pointerEvents = "none";
          tooltip.style.whiteSpace = "normal";
          tooltip.style.maxWidth = "300px"; // Set a max width to avoid too wide tooltips
          tooltip.style.zIndex = "1000";          

          document.body.appendChild(tooltip); // Append tooltip to body

          // On click of word open its context in the side_panel
          mark.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: key,
            });
          });

          // Show tooltip and adjust position
          mark.addEventListener("mouseenter", () => {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";

            const rect = mark.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            let left = rect.left + window.scrollX + (rect.width - tooltipRect.width) / 2;
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

          // Hide tooltip
          mark.addEventListener("mouseleave", () => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
          });
        }
      });
    }
  }
};

