const api = self.browser || self.chrome;

let debugLogs = [];

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "debug") {
    debugLogs.unshift({
      time: new Date().toISOString(),
      message: msg.message,
      data: msg.data,
      url: msg.url,
    });
    if (debugLogs.length > 100) debugLogs.pop();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "getDebug") {
    sendResponse(debugLogs);
    return true;
  }

  if (msg.type === "trackChapter") {
    const { name, chapter, url } = msg;

    api.storage.local.get(name, (res) => {
      const existing = res[name] || null;

      if (!existing || parseInt(chapter) > parseInt(existing.chapter)) {
        // ✅ Only update if it's the first time OR if chapter is higher
        api.storage.local.set({
          [name]: { chapter: chapter, url: url },
        });
        debugLogs.unshift({
          time: new Date().toISOString(),
          message: "📌 Chapter updated",
          data: { name, chapter, url },
        });
      } else {
        debugLogs.unshift({
          time: new Date().toISOString(),
          message: "ℹ️ Chapter ignored (lower or equal)",
          data: { name, newChapter: chapter, savedChapter: existing.chapter },
        });
      }
    });

    sendResponse({ ok: true });
    return true;
  }
});
