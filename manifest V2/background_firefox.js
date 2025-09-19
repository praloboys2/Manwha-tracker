// background.js (Firefox / Zen - MV2)
window.browser = window.browser || window.chrome;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || !request.type) return;

  if (request.type === "saveChapter") {
    browser.storage.local.set({
      [request.name]: { chapter: request.chapter, url: request.url },
    });
    return;
  }

  if (request.type === "debug") {
    const log = request.log || request;
    browser.storage.local.get("__debug_logs__").then((res) => {
      const logs = res.__debug_logs__ || [];
      logs.unshift(log);
      if (logs.length > 200) logs.length = 200;
      browser.storage.local.set({ __debug_logs__: logs });
    });
    console.log("ManhwaTracker debug:", log);
    return;
  }

  if (request.type === "getDebug") {
    browser.storage.local
      .get("__debug_logs__")
      .then((res) => sendResponse(res.__debug_logs__ || []));
    return true;
  }

  if (request.type === "getChapter") {
    browser.storage.local
      .get(request.name)
      .then((result) => sendResponse(result[request.name] || null));
    return true;
  }
});
