// In-page cache of the user's options
const options = {};
var tags = [];

// Function to update highlight colors in active tabs
async function updateHighlightColorsInTabs(color) {
  try {
    const tabs = await chrome.tabs.query({}); //Query all tabs

    //Send message to content script in each tab
    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "update_highlight_color",
          color: color,
          timestamp: Date.now(), // Add timestamp to ensure message is treated as new
        })
        .catch(() => {
          // Ignore errors for tabs where content script isn't loaded
        });
    }
  } catch (error) {
    console.error("Error updating tabs:", error);
  }
}

async function updateLabelColorsInTabs(color) {
  try {
    const tabs = await chrome.tabs.query({}); // Query all tabs

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "update_label_color",
          color: color,
          timestamp: Date.now(), // Add timestamp to ensure message is treated as new
        });
        successCount++;
      } catch (error) {
        // Ignore errors for tabs where content script isn't loaded
      }
    }
  } catch (error) {
    console.error("Error updating tabs:", error);
  }
}

// Saves options to chrome.storage
// Takes page level options variable which has been updated and sets it to Sync Storage.
const saveOptions = () => {
  // Store previous color values
  const previousHighlightColor = options.hightlight_color;
  const previousLabelColor = options.label_color;

  // Update the options cache with new values
  options.hightlight_color = document.getElementById("hightlight-color").value;
  options.label_color = document.getElementById("label-color").value;

  // Get the selected highlight styles (bold, underline, italic)
  const highlight_style = [];
  document.querySelectorAll(".highlight-style").forEach((checkbox) => {
    if (checkbox.checked == true) highlight_style.push(checkbox.value);
  });
  options.highlight_style = highlight_style;

  options.classifications = tags;

  // Update status to let user know we're saving
  const status = document.getElementById("status");
  status.textContent = "Saving options...";
  status.className = "saving";

  chrome.storage.sync.set({ options }, () => {
    makeChips();
    // Check for any errors
    if (chrome.runtime.lastError) {
      console.error("Error saving options:", chrome.runtime.lastError);
      status.textContent = "Error saving options.";
      setTimeout(() => {
        status.textContent = "";
        status.className = "";
      }, 1500);
      return;
    }

    // Update status to let user know options were saved.
    status.textContent = "Options saved!";
    status.className = "";
    setTimeout(() => {
      status.textContent = "";
    }, 1500);

    console.log("Saved options:", options);

    // If highlight color changed, update it in all tabs
    if (options.hightlight_color !== previousHighlightColor) {
      updateHighlightColorsInTabs(options.hightlight_color);
    }

    // If label color changed, update it in all tabs
    if (options.label_color !== previousLabelColor) {
      updateLabelColorsInTabs(options.label_color);
    }
  });

  chrome.runtime.sendMessage({
    action: "reload_data",
  });
};

// Function to restore the options from the Chrome Sync Storage.
// Gets data from any synced options, and if they exist set them on the page, otherwise set to default.
async function restoreOptions() {
  const data = await chrome.storage.sync.get("options");
  Object.assign(options, data.options); // Merge data into options cache
  // Set the options form fields based on the cached options
  if (options.hightlight_color)
    document.getElementById("hightlight-color").value =
      options.hightlight_color;
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

// Function to make the classification tags from collected data.
// Also sets the proper color from list_color data.
function makeChips() {
  console.log(options.label_color_color);
  const classificationLabelsContainer = document.body.querySelector(
    "#classification-labels-container",
  );
  classificationLabelsContainer.innerHTML = tags
    .map(
      (classification) =>
        `<button class="chip" style="background-color: ${list_colors.get(classification)?.highlight || document.getElementById("label-color").value}; color: ${list_colors.get(classification)?.text || "#000000"};"role="tag" aria-label="Classified as ${classification}">${classification}</button>`,
    )
    .join("");

  let chips = document.querySelectorAll(".chip");
  chips.forEach((tag) => {
    chipRemove(tag);
  });
}

// Function to remove classification tag / chip here when it is clicked.
//When a chip is clicked, remove it from list of tags, but add it back to the selectable tags list
function chipRemove(newTag) {
  newTag.addEventListener("click", function () {
    var opt = document.createElement("option");
    opt.value = newTag.innerHTML;
    opt.innerHTML = newTag.innerHTML;
    tagSelect.appendChild(opt); //
    newTag.remove();
    const index = tags.indexOf(newTag.innerHTML);
    if (index > -1) {
      tags.splice(index, 1);
    }
  });
}

// List_colors to get from data
let list_colors = new Map();

// Function to fill the tags that can be selected with initial data.
// Uses tag data gotten from Service Worker and local storage.
async function fillTagSelect(selectedTags) {
  await chrome.storage.local.get("data", function (data) {
    if (data.data && data.data.tags) {
      let tags = data.data.tags;
      list_colors = new Map(Object.entries(data.data.list_colors));
      makeChips();
      tagSelect = document.getElementById("tag-select");
      tags.forEach((tag) => {
        //Loop through all tags in the json response
        if (!selectedTags || !selectedTags.includes(tag)) {
          //If the tag is not already selected, add it to the selectable tags list
          console.log(tag);
          var opt = document.createElement("option");
          opt.value = tag;
          opt.innerHTML = tag;
          tagSelect.appendChild(opt);
        }
      });
    }
  });
}

// Code that runs when a tag is selected.
// The select option is removed and the tag's chip is made.
tagSelect = document.getElementById("tag-select");
tagSelect.onchange = function () {
  //Event handler for when a tag is selected
  tags.push(tagSelect.value);
  makeChips(); //Make a chip for the selected tag
  removeValue = tagSelect.value; //Remove the selected tag from the selectable tags list
  tagSelect.value = "";
  for (var i = 0; i < tagSelect.length; i++) {
    if (tagSelect.options[i].value == removeValue) tagSelect.remove(i);
  }
};

document.addEventListener("DOMContentLoaded", restoreOptions); //Restore options when the page is loaded
document.getElementById("save").addEventListener("click", saveOptions); //Save options when the save button is clicked

// Unused function just to see if the server is running.
// Initially used for testing, but could be useful in the future.
async function getStatus() {
  //Check if the server is running
  try {
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
