// In-page cache of the user's options
const options = {};
var tags = [];

// Function to update highlight colors in active tabs
async function updateHighlightColorsInTabs(color) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        action: "update_highlight_color",
        color: color
      }).catch(() => {
        // Ignore errors for tabs where content script isn't loaded
      });
    }
  } catch (error) {
    console.error("Error updating tabs:", error);
  }
}

// Saves options to chrome.storage
const saveOptions = () => {
  // Update the options cache
  options.hightlight_color = document.getElementById("hightlight-color").value;
  const previousHighlightColor = options.hightlight_color;
  options.label_color = document.getElementById("label-color").value;

  const highlight_style = [];
  document.querySelectorAll(".highlight-style").forEach((checkbox) => {
    if (checkbox.checked == true) highlight_style.push(checkbox.value);
  });
  options.highlight_style = highlight_style;

  options.classifications = tags;

  chrome.storage.sync.set({ options }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);

    // If highlight color changed, update it in all tabs
    if (options.hightlight_color !== previousHighlightColor) {
      updateHighlightColorsInTabs(options.hightlight_color);
    }
  });
};

async function restoreOptions() {
  const data = await chrome.storage.sync.get("options");
  Object.assign(options, data.options);
  if (options.hightlight_color)
    document.getElementById("hightlight-color").value = options.hightlight_color;
  if (options.label_color)
    document.getElementById("label-color").value = options.label_color;
  if (options.highlight_style) {
    document.querySelectorAll(".highlight-style").forEach((checkbox) => {
      if (options.highlight_style.includes(checkbox.value))
        checkbox.checked = true;
    });
  }
  if (options.classifications) {
    tags = options.classifications;
    makeChips();
  }
  fillTagSelect(options.classifications);
}

function makeChips() {
  const classificationLabelsContainer = document.body.querySelector(
    "#classification-labels-container"
  );
  classificationLabelsContainer.innerHTML = tags
    .map(
      (classification) =>
        `<button class="chip" role="tag" aria-label="Classified as ${classification}">${classification}</button>`
    )
    .join("");

  let chips = document.querySelectorAll(".chip");
  chips.forEach((tag) => {
    chipRemove(tag);
  });
}

async function fillTagSelect(selectedTags) {
  try {
    // const url = "http://localhost:3000/status";
    // const url = "https://pbenzoni.pythonanywhere.com/status";
    const url = "https://context.tools/tags";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json);
    tagSelect = document.getElementById("tag-select");
    json.tags.forEach((tag) => {
      if (!selectedTags || !selectedTags.includes(tag)) {
        console.log(tag);
        var opt = document.createElement("option");
        opt.value = tag;
        opt.innerHTML = tag;
        tagSelect.appendChild(opt);
      }
    });
  } catch (error) {
    console.error("Error: " + error.message);
  }
}

// Set up color input event listeners
document.getElementById("hightlight-color").addEventListener("input", (event) => {
  const newColor = event.target.value;
  updateHighlightColorsInTabs(newColor);
});


tagSelect = document.getElementById("tag-select");
tagSelect.onchange = function () {
  tags.push(tagSelect.value);
  makeChips();
  removeValue = tagSelect.value;
  tagSelect.value = "";
  for (var i = 0; i < tagSelect.length; i++) {
    if (tagSelect.options[i].value == removeValue) tagSelect.remove(i);
  }
};

function chipRemove(newTag) {
  newTag.addEventListener("click", function () {
    var opt = document.createElement("option");
    opt.value = newTag.innerHTML;
    opt.innerHTML = newTag.innerHTML;
    tagSelect.appendChild(opt);
    newTag.remove();
    const index = tags.indexOf(newTag.innerHTML);
    if (index > -1) {
      tags.splice(index, 1);
    }
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

async function getStatus() {
  try {
    // const url = "http://localhost:3000/status";
    // const url = "https://pbenzoni.pythonanywhere.com/status";
    const url = "https://context.tools/status";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error("Error: " + error.message);
  }
}
getStatus();
