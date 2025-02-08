// In-page cache of the user's options
const options = {};

// Saves options to chrome.storage
const saveOptions = () => {
  options.hightlight_color = document.getElementById("hightlight-color").value;
  options.label_color = document.getElementById("label-color").value;

  const highlight_style = [];
  document.querySelectorAll(".highlight-style").forEach((checkbox) => {
    if (checkbox.checked == true) highlight_style.push(checkbox.value);
  });
  options.highlight_style = highlight_style;

  chrome.storage.sync.set({ options }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

async function restoreOptions() {
  const data = await chrome.storage.sync.get("options");
  Object.assign(options, data.options);
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
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
