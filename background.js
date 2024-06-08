

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch") && changeInfo.status === 'complete') {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const videoId = urlParameters.get("v");

    if (videoId) {
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: videoId,
      });
    }
  }
});