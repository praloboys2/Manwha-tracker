
vchrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "saveChapter") {
    chrome.storage.local.set(
      {
        [request.name]: {
          chapter: request.chapter,
          url: request.url,
        },
      },
      () => {
        console.log(`Saved: ${request.name} → Chapter ${request.chapter}`);
      }
    );
  }

  if (request.type === "getChapter") {
    chrome.storage.local.get([request.name], (result) => {
      sendResponse(result[request.name] || null);
    });
    return true; // async
  }
});
