window.browser = (function () {
  return window.browser || window.chrome;
})();

const sites = [
  "https://asuracomic.com/manga/",
  "https://reaperscans.com/series/",
];

const currentUrl = window.location.href;
let matchedSite = sites.find((site) => currentUrl.startsWith(site));

if (matchedSite) {
  let parts = currentUrl.replace(matchedSite, "").split("/");

  let name = parts[0].replace(/-/g, " ");
  let chapter = parts.find((p) => p.includes("chapter"));
  if (chapter) {
    chapter = chapter.replace("chapter-", "");
  }

  if (name && chapter) {
    browser.runtime.sendMessage({
      type: "saveChapter",
      name: name,
      chapter: chapter,
      url: currentUrl,
    });
  }
}
