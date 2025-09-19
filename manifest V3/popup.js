const api = window.browser || window.chrome;

function sendMessage(msg) {
  try {
    const maybePromise = api.runtime.sendMessage(msg);
    if (maybePromise && typeof maybePromise.then === "function")
      return maybePromise;
    return new Promise((resolve) => {
      api.runtime.sendMessage(msg, (res) => resolve(res));
    });
  } catch (e) {
    return Promise.resolve(null);
  }
}

function storageGetAll() {
  try {
    const res = api.storage.local.get(null);
    if (res && typeof res.then === "function") return res;
    return new Promise((resolve) => api.storage.local.get(null, resolve));
  } catch (e) {
    return Promise.resolve({});
  }
}

function escapeHtml(s) {
  return (s + "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const listDiv = document.getElementById("list");
  const debugDiv = document.getElementById("debug");
  const refreshBtn = document.getElementById("refreshLogs");
  const resetBtn = document.getElementById("resetStorage");

  // render tracked manhwas
  function renderTracked(data) {
    const keys = Object.keys(data || {}).filter((k) => k !== "__debug_logs__");
    if (keys.length === 0) {
      listDiv.innerHTML = "<p>No manhwa tracked yet.</p>";
      return;
    }
    let html = "<ul>";
    for (const name of keys) {
      const info = data[name];
      html += `<li><b>${escapeHtml(
        name
      )}</b> : <a href="#" class="chapter-link" data-url="${escapeHtml(
        info.url
      )}">Chapter ${escapeHtml(info.chapter)}</a></li>`;
    }
    html += "</ul>";
    listDiv.innerHTML = html;

    document.querySelectorAll(".chapter-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = e.currentTarget.dataset.url;
        api.tabs.create({ url });
      });
    });
  }

  function renderDebug(logs) {
    if (!window.conditionDebug) {
      debugDiv.innerHTML = "";
      return;
    }
    if (!logs || logs.length === 0) {
      debugDiv.innerHTML = "<p>No debug logs yet.</p>";
      return;
    }
    let html = "<ol>";
    for (const l of logs.slice(0, 30)) {
      html += `<li><pre>${escapeHtml(JSON.stringify(l, null, 2))}</pre></li>`;
    }
    html += "</ol>";
    debugDiv.innerHTML = html;
  }

  // Load tracked items
  const data = await storageGetAll();
  renderTracked(data);

  // Fetch debug logs
  async function fetchDebug() {
    const logs = await sendMessage({ type: "getDebug" });
    renderDebug(logs || []);
  }

  if (refreshBtn) refreshBtn.addEventListener("click", fetchDebug);
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      api.storage.local.clear(() => {
        listDiv.innerHTML = "<p>All data reset!</p>";
      });
    });
  }

  fetchDebug();
});
