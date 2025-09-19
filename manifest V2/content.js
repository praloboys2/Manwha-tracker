// content.js (debug-enabled, cross-browser)
const browserAPI = window.browser || window.chrome;

(function () {
  function debugSend(obj) {
    const log = Object.assign(
      {
        ts: new Date().toISOString(),
        pageUrl: window.location.href,
      },
      obj
    );
    // console output (open page DevTools to see these)
    console.log("ManhwaTracker DEBUG:", log);
    try {
      browserAPI.runtime.sendMessage({ type: "debug", log });
    } catch (e) {
      console.warn(
        "ManhwaTracker: could not send debug (runtime not available):",
        e
      );
    }
  }

  // Patterns to try (add or modify entries for other sites)
  const patterns = [
    {
      name: "AsuraComic - series",
      host: "asuracomic.net",
      regex: /\/series\/([^/]+)\/chapter\/(\d+)/i,
    },
    {
      name: "AsuraComic - old-manga",
      host: "asuracomic.com",
      regex: /\/manga\/([^/]+)\/chapter[-\/]?(\d+)/i,
    },
    {
      name: "ReaperScans - series",
      host: "reaperscans.com",
      regex: /\/series\/([^/]+)\/chapter[-\/]?(\d+)/i,
    },
    // generic fallback: any /slug/(chapter|chap|ch)/number
    {
      name: "Generic - /slug/chapter/num",
      host: null,
      regex: /\/([^/]+)\/(?:chapter|chap|ch)[-\/]?(\d+)/i,
    },
  ];

  const url = window.location.href;
  let urlObj = null;
  try {
    urlObj = new URL(url);
  } catch (e) {
    /* ignore */
  }
  const host = urlObj ? urlObj.hostname : location.hostname;

  // Try site-specific patterns first
  let matched = null;
  for (const p of patterns) {
    if (p.host && !host.includes(p.host)) continue;
    const m = url.match(p.regex);
    if (m) {
      matched = { p, groups: m };
      break;
    }
  }

  if (matched) {
    // extraction from regex groups
    let rawName = matched.groups[1] || "";
    // Clean trailing weird id like "-fbd15572" (common on asuracomic)
    rawName = rawName.replace(/-\w{5,}$/i, "");
    const normalizedName = rawName.replace(/-/g, " ").trim();
    const chapter = (matched.groups[2] || "").replace(/\D/g, "");
    debugSend({
      event: "pattern_matched",
      pattern: matched.p.name,
      host,
      normalizedName,
      chapter,
    });

    if (normalizedName && chapter) {
      try {
        browserAPI.runtime.sendMessage({
          type: "saveChapter",
          name: normalizedName,
          chapter,
          url,
        });
        debugSend({ event: "saved", name: normalizedName, chapter, url });
      } catch (e) {
        debugSend({ event: "save_error", error: String(e) });
      }
    }
    return;
  }

  // If no regex matched, fallback to page metadata / title heuristics
  const pageTitle = document.title || "";
  const metaOg =
    (
      document.querySelector(
        'meta[property="og:title"], meta[name="og:title"]'
      ) || {}
    ).getAttribute?.call?.(
      document.querySelector(
        'meta[property="og:title"], meta[name="og:title"]'
      ),
      "content"
    ) || null;
  const h1 = document.querySelector("h1")?.innerText?.trim?.() || null;

  // Try to parse "Name Chapter 70" from title
  const titleMatch =
    pageTitle.match(/^(.*?)\s+(?:Chapter|Ch|Ch\.)\s*(\d+)/i) ||
    pageTitle.match(/^(.*?)\s+#?(\d+)\s*$/i);
  if (titleMatch) {
    const name = titleMatch[1].replace(/-/g, " ").trim();
    const chapter = titleMatch[2].replace(/\D/g, "");
    debugSend({ event: "title_matched", pageTitle, name, chapter });
    browserAPI.runtime.sendMessage({ type: "saveChapter", name, chapter, url });
    return;
  }

  // Try og:title
  if (metaOg) {
    const m = metaOg.match(/^(.*?)\s+(?:Chapter|Ch)\s*(\d+)/i);
    if (m) {
      const name = m[1].replace(/-/g, " ").trim();
      const chapter = m[2].replace(/\D/g, "");
      debugSend({ event: "og_matched", metaOg, name, chapter });
      browserAPI.runtime.sendMessage({
        type: "saveChapter",
        name,
        chapter,
        url,
      });
      return;
    }
  }

  // No match — dump debug info so you can inspect what the page looks like
  debugSend({
    event: "no_match",
    host,
    pathname: urlObj ? urlObj.pathname : location.pathname,
    pageTitle,
    h1,
    metaOg,
    sampleSelectors: {
      ".series-title":
        document.querySelector(".series-title")?.innerText || null,
      ".title": document.querySelector(".title")?.innerText || null,
    },
  });
})();
