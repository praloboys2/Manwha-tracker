const api = window.browser || window.chrome;

// Global flag (can be set in console: conditionDebug = true)
window.conditionDebug = window.conditionDebug || false;

function logDebug(msg, data = null) {
  if (!window.conditionDebug) return; // Skip logging if flag is false

  api.runtime.sendMessage({
    type: "debug",
    message: msg,
    data: data,
    url: location.href,
  });
}

function normalizeTitle(title) {
  return title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

(function () {
  const url = window.location.href;

  const match = url.match(/\/series\/([^/]+)\/chapter\/(\d+)/i);

  if (match) {
    let rawName = decodeURIComponent(match[1]).replace(/[-_]/g, " ");
    rawName = rawName.replace(/\s?[a-f0-9]{6,}$/i, "");
    const title = normalizeTitle(rawName);
    const chap = match[2];

    logDebug("✅ URL matched Asura pattern", { title, chapter: chap });

    api.runtime.sendMessage({
      type: "trackChapter",
      name: title,
      chapter: chap,
      url: url,
    });
  } else {
    logDebug("❌ No chapter pattern matched", { url });
  }
})();
