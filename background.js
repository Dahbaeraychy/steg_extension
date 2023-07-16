// NOTE: alert function (typically not required but looks better)
const displayAnswer = (message) => {
  alert(message);
};

// NOTE: contextMenu callback function

const contextMenuCallback = async (info) => {
  if (info.menuItemId == "check_image") {
    await getPredictions(info.srcUrl);
  }
};

// NOTE: mime type white-list
const image_mimetypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/heif",
  "image/heic",
  "image/jxr",
  "image/jp2",
  "image/jpm",
  "image/jpx",
  "image/ief",
  "image/x-portable-anymap",
  "image/x-portable-bitmap",
  "image/x-portable-graymap",
  "image/x-portable-pixmap",
];

// NOTE: API URL
const apiUrl = "https://steg-api.up.railway.app/predict";

// NOTE: Function to get prediction

const getPredictions = async (url) => {
  const data = {
    url,
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });

  const predict = await res.json();

  if (!predict || !predict.status === "SUCCESS") {
    return;
  }

  // NOTE: Get active tab to send alert to
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    return;
  }

  // NOTE: sends alert to active tab (service workers do not have native alert support)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: displayAnswer,
    args: [predict.message],
  });
};

// NOTE: Triggers file prediction on image download
chrome.downloads.onCreated.addListener(async (download) => {
  if (!image_mimetypes.includes(download.mime)) {
    return;
  }

  await getPredictions(download.finalUrl);
});

// NOTE: Add contextMenu on install to prevent idile duplicates
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check_image",
    title: "Check image for steg",
    contexts: ["image"],
  });
});

// NOTE: Handles contextMenu Click
chrome.contextMenus.onClicked.addListener(contextMenuCallback);
