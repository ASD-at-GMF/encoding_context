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
          mark.innerHTML += template;
          mark.classList.add("encon_tooltip");
          mark.tabIndex = "0";
          mark.children[0].tabIndex = "0";
          mark.children[0].classList.add("tooltiptext");
          mark.children[0].children[0].classList.add("tooltipheader");
          mark.children[0].children[2].classList.add("tooltipcontext");
          mark.children[0].children[0].textContent = mark.textContent;
          mark.children[0].children[2].textContent = value;

          // On click of word open its context in the side_panel
          mark.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: key,
            });
          });

          // Adjust tooltip position dynamically to prevent overflow
          mark.addEventListener("mouseenter", () => {
            const tooltipText = mark.querySelector(".tooltiptext");

            // Temporarily make the tooltip visible to calculate its position
            tooltipText.style.visibility = "hidden";
            tooltipText.style.opacity = "0";
            tooltipText.style.display = "block";

            // Force reflow to ensure accurate positioning on first hover
            tooltipText.getBoundingClientRect();

            const rect = tooltipText.getBoundingClientRect();
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight;

            // Reset tooltip position
            tooltipText.style.left = "50%";
            tooltipText.style.bottom = "125%";
            tooltipText.style.transform = "translateX(-50%)";
            tooltipText.style.top = "auto";

            // Adjust if tooltip overflows right
            if (rect.right > viewWidth) {
              tooltipText.style.left = "auto";
              tooltipText.style.right = "0";
              tooltipText.style.transform = "none";
            }

            // Adjust if tooltip overflows left
            if (rect.left < 0) {
              tooltipText.style.left = "0";
              tooltipText.style.transform = "none";
            }

            // Adjust if tooltip overflows top
            if (rect.top < 0) {
              tooltipText.style.bottom = "auto"; // Reset bottom position
              tooltipText.style.top = "125%"; // Position below the word
              tooltipText.style.transform = "translateX(-50%)";
            }

            // Restore visibility after positioning
            tooltipText.style.visibility = "visible";
            tooltipText.style.opacity = "1";
            tooltipText.style.display = "";
          });

          // Hide tooltip on mouse leave
          mark.addEventListener("mouseleave", () => {
            const tooltipText = mark.querySelector(".tooltiptext");
            tooltipText.style.visibility = "hidden";
            tooltipText.style.opacity = "0";
            tooltipText.style.display = "none"; // Reset to ensure proper recalculation on next hover
          });
        }
      });
    }
  }
};
