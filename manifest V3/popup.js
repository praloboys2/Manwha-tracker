document.addEventListener("DOMContentLoaded", () => {
  const listDiv = document.getElementById("list");

  chrome.storage.local.get(null, (data) => {
    if (Object.keys(data).length === 0) {
      listDiv.innerHTML = "<p>No manhwa tracked yet.</p>";
      return;
    }

    let html = "<ul>";
    for (let [name, info] of Object.entries(data)) {
      html += `<li>
                 <b>${name}</b> :
                 <a href="#" class="chapter-link" data-url="${info.url}">
                   Chapter ${info.chapter}
                 </a>
               </li>`;
    }
    html += "</ul>";

    listDiv.innerHTML = html;

    document.querySelectorAll(".chapter-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = e.target.dataset.url;
        chrome.tabs.create({ url });
      });
    });
  });
});
