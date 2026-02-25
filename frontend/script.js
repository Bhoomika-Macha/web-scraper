/* ================== CONSTANTS ================== */
const TABS = [
  "All","Inspirational","Life","Humor","Books","Reading",
  "Friendship","Friends","Love","Truth","Simile"
];

/* ================== ELEMENTS ================== */
const tabsEl = document.getElementById("tabs");
const carousel = document.getElementById("carousel");
const loadingText = document.getElementById("loading");

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const categoryEl = document.getElementById("category");
const quoteCard = document.getElementById("quoteCard");

const wishBtn = document.getElementById("wishlistBtn");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const hideBtn = document.getElementById("hideBtn");

const counts = {
  wish: document.getElementById("wishCount"),
  like: document.getElementById("likeCount"),
  dislike: document.getElementById("dislikeCount"),
  hidden: document.getElementById("hiddenCount")
};

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const overlay = document.getElementById("overlay");
const closeSettings = document.getElementById("closeSettings");
const settingsList = document.getElementById("settingsList");

const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

/* ================== STATE ================== */
let quotes = [];
let index = 0;
let autoTimer = null;

let activeTabs = new Set();          // selected filter tabs
let enabledTabs = new Set(TABS);     // enabled via settings

let wishlist = new Set();
let liked = new Set();
let disliked = new Set();
let hidden = new Set();

/* ================== FETCH ================== */
fetch("/quotes")
  .then(r => r.json())
  .then(d => {
    quotes = d.quotes.filter(q =>
      q.tags.some(t => TABS.map(x => x.toLowerCase()).includes(t))
    );

    loadingText.style.display = "none";
    carousel.style.display = "flex";

    renderTabs();
    renderSettings();
    showQuote();
    startAutoPlay();
  })
  .catch(() => {
    loadingText.textContent = "Failed to load quotes";
  });

/* ================== TABS ================== */
function renderTabs() {
  tabsEl.innerHTML = "";

  enabledTabs.forEach(tab => {
    if (!TABS.includes(tab)) return;

    const el = document.createElement("div");
    el.className = "tab";

    if (
      tab === "All" && activeTabs.size === 0 ||
      activeTabs.has(tab)
    ) el.classList.add("active");

    el.textContent = tab;
    el.onclick = () => toggleTab(tab, el);
    tabsEl.appendChild(el);
  });
}

function toggleTab(tab, el) {
  if (tab === "All") {
    activeTabs.clear();
  } else {
    activeTabs.has(tab)
      ? activeTabs.delete(tab)
      : activeTabs.add(tab);
  }

  index = 0;
  renderTabs();
  showQuote();
}

/* ================== FILTER ================== */
function filteredQuotes() {
  if (!activeTabs.size) {
    return quotes.filter(q =>
      q.tags.some(t => enabledTabs.has(cap(t)))
    );
  }

  return quotes.filter(q =>
    q.tags.some(t =>
      activeTabs.has(cap(t)) && enabledTabs.has(cap(t))
    )
  );
}

/* ================== QUOTE ================== */
function showQuote() {
  const list = filteredQuotes();
  if (!list.length) return;

  index = (index + list.length) % list.length;
  const q = list[index];

  quoteText.textContent = `"${q.text}"`;
  quoteAuthor.textContent = `— ${q.author}`;
  categoryEl.textContent = cap(q.tags[0]);

  quoteCard.classList.toggle("blur", hidden.has(q._id));

  wishBtn.classList.toggle("active", wishlist.has(q._id));
  likeBtn.classList.toggle("liked", liked.has(q._id));
  dislikeBtn.classList.toggle("disliked", disliked.has(q._id));

  updateCounts();
}

/* ================== COUNTS ================== */
function updateCounts() {
  counts.wish.textContent = wishlist.size;
  counts.like.textContent = liked.size;
  counts.dislike.textContent = disliked.size;
  counts.hidden.textContent = hidden.size;
}

/* ================== ACTIONS ================== */
wishBtn.onclick = () => toggleSet(wishlist);
likeBtn.onclick = () => toggleSet(liked, disliked);
dislikeBtn.onclick = () => toggleSet(disliked, liked);
hideBtn.onclick = () => toggleSet(hidden);

function toggleSet(set, other) {
  const q = filteredQuotes()[index];
  if (!q) return;

  set.has(q._id) ? set.delete(q._id) : set.add(q._id);
  if (other) other.delete(q._id);

  showQuote();
}

/* ================== NAV ================== */
nextBtn.onclick = () => {
  index++;
  showQuote();
};

prevBtn.onclick = () => {
  index--;
  showQuote();
};

/* ================== AUTOPLAY ================== */
function startAutoPlay() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    index++;
    showQuote();
  }, 5000);
}

/* ================== SETTINGS ================== */
settingsBtn.onclick = () => {
  settingsPanel.style.display = "block";
  overlay.style.display = "block";
};

closeSettings.onclick = overlay.onclick = () => {
  settingsPanel.style.display = "none";
  overlay.style.display = "none";
};

function renderSettings() {
  settingsList.innerHTML = "";

  TABS.slice(1).forEach(tab => {
    const row = document.createElement("div");
    row.className = "toggle-row";

    const label = document.createElement("span");
    label.textContent = tab;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = enabledTabs.has(tab);

    input.onchange = () => {
      input.checked
        ? enabledTabs.add(tab)
        : enabledTabs.delete(tab);

      activeTabs.delete(tab);
      renderTabs();
      showQuote();
    };

    row.append(label, input);
    settingsList.appendChild(row);
  });
}

/* ================== UTIL ================== */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);