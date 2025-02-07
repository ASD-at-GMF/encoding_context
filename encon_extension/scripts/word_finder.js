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

          // On click of word open it's context in the side_panel
          mark.addEventListener("click", function () {
            chrome.runtime.sendMessage({
              action: "open_side_panel",
              word: key,
            });
          });
        }
      });
    }
  }
};


