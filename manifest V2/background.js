window.browser = (function () {
  return window.browser || window.chrome;
})();

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "saveChapter") {
    browser.storage.local.set({
      [request.name]: {
        chapter: request.chapter,
        url: request.url,
      },
    });
  }

  if (request.type === "getChapter") {
    browser.storage.local.get(request.name).then((result) => {
      sendResponse(result[request.name] || null);
    });
    return true;
  }
});
