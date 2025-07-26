let tonightTheme = null;

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const stars = document.getElementById("stars-background");
  stars.style.backgroundPositionY = `${scrolled * 0.1}px`;
});

async function loadTheme() {
  try {
    const res = await fetch("/api/theme");
    const data = await res.json();
    tonightTheme = data.theme;

    const themeEl = document.getElementById("theme-text");
    themeEl.textContent = tonightTheme;
    themeEl.style.visibility = "visible";
  } catch (err) {
    console.error("failed to fetch theme", err);
  }
}

function getRelativeTimeString(date) {
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function setThemeBasedOnTime() {
  const body = document.body;
  const hour = new Date().getHours();
  const mode = hour >= 5 && hour < 22 ? "day" : "night";

  body.classList.toggle("day", mode === "day");
  body.classList.toggle("night", mode === "night");

  const stars = document.getElementById("stars-background");
  stars.style.display = mode === "day" ? "none" : "block";
}

function getDateStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function getTodayKey() {
  const now = new Date();
  return `postCount-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function getPostCount() {
  return parseInt(localStorage.getItem(getTodayKey())) || 0;
}

function updatePostCounter() {
  const count = getPostCount();
  document.getElementById("post-counter").textContent = `${count}/3 shared`;
}

function incrementPostCount() {
  const key = getTodayKey();
  const current = getPostCount();
  localStorage.setItem(key, current + 1);
  updatePostCounter();
}

function updateLockedMessage(mode) {
  const msg = document.getElementById("locked-message");
  msg.innerHTML =
    mode === "day"
      ? "🔒 posting opens at 10PM"
      : "🕐 posting is open until 5AM";
}

async function updatePostingAccess() {
  const hour = new Date().getHours();
  const mode = hour >= 5 && hour < 22 ? "day" : "night";

  const body = document.body;
  const input = document.getElementById("thought-input");
  const submit = document.getElementById("submit-button");
  const checkbox = document.getElementById("relates-checkbox");
  const themeSection = document.getElementById("theme");
  const themeText = document.querySelector(".theme-text");
  const lockedMsg = document.getElementById("locked-message");

  const disable = mode === "day";
  input.disabled = disable;
  submit.disabled = disable;
  checkbox.disabled = disable;
  submit.style.cursor = disable ? "not-allowed" : "pointer";
  themeSection.style.display = disable ? "none" : "block";
  themeText.textContent = disable ? "" : tonightTheme || "no theme set";
  body.classList.toggle("form-locked", disable);
  lockedMsg.classList.toggle("show", disable);

  const today = getDateStamp();
  const lastUsed = localStorage.getItem("lastPostDate");
  if (lastUsed !== today) {
    localStorage.setItem(getTodayKey(), 0);
    localStorage.setItem("lastPostDate", today);
    document.getElementById("post-form").classList.remove("post-limit-locked");
    document.getElementById("final-message")?.classList.remove("show");
  }

  updateLockedMessage(mode);
}

function playTransition(mode) {
  const overlay = document.getElementById("transition-overlay");
  const orb = document.getElementById("sky-orb");
  const title = document.getElementById("transition-title");
  const sub = document.getElementById("transition-sub");

  orb.innerText = mode === "night" ? "🌙" : "🌞";
  title.innerText = mode === "night" ? "good night" : "good morning";
  sub.innerText =
    mode === "night" ? "time to wind down...💤" : "it’s a new day!";

  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 2500);
}

function checkPostLimit() {
  const count = getPostCount();
  updatePostCounter();
  if (count < 3) return;

  const input = document.getElementById("thought-input");
  const submit = document.getElementById("submit-button");
  const checkbox = document.getElementById("relates-checkbox");
  const final = document.getElementById("final-message");
  const form = document.getElementById("post-form");

  input.disabled = true;
  submit.disabled = true;
  checkbox.disabled = true;
  submit.style.cursor = "not-allowed";
  form.classList.add("post-limit-locked");

  const isNight = document.body.classList.contains("night");
  final.classList.toggle("show", isNight);
}

async function submitThought(text) {
  const themeText = document.querySelector(".theme-text")?.textContent;
  const checkbox = document.getElementById("relates-checkbox");

  const postData = {
    text,
    theme: checkbox.checked ? themeText : null,
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    if (!res.ok) throw new Error("submit failed");

    await res.json();
    incrementPostCount();
    checkPostLimit();
    loadRecentPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const submitButton = document.getElementById("submit-button");
    submitButton.disabled = true;
    submitButton.style.opacity = "0.6";
    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }, 1000);

    document.getElementById("relates-checkbox").checked = false;
  } catch (err) {
    console.error("❌ submit error:", err);
  }
}

function truncateText(text) {
  return text.length <= 250 ? text : text.slice(0, 250) + "...";
}

function createPostElement(post, animate = true) {
  const postEl = document.createElement("div");
  postEl.dataset.id = post.id;
  postEl.classList.add("post");

  setTimeout(() => postEl.classList.add("visible"), animate ? 30 : 0);

  const utcDate = new Date(post.created_at);
  const timeSpan = document.createElement("span");
  timeSpan.className = "post-time";
  timeSpan.dataset.timestamp = post.created_at;
  timeSpan.textContent = getRelativeTimeString(utcDate);

  const themeSpan = document.createElement("span");
  themeSpan.className = "post-theme";
  themeSpan.textContent = post.theme || "";
  themeSpan.style.visibility = post.theme ? "visible" : "hidden";

  const header = document.createElement("div");
  header.classList.add("post-header");
  header.appendChild(themeSpan);
  header.appendChild(timeSpan);

  const divider = document.createElement("hr");
  divider.className = "post-divider";

  const contentEl = document.createElement("p");
  contentEl.className = "post-content";
  const words = post.text.split(" ");
  const limit = 40;

  if (words.length > limit) {
    const short = words.slice(0, limit).join(" ") + "...";
    let expanded = false;
    const toggleBtn = document.createElement("span");
    toggleBtn.className = "read-more";
    toggleBtn.textContent = "read more";

    toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      contentEl.textContent = expanded ? post.text : short;
      toggleBtn.textContent = expanded ? "show less" : "read more";
      contentEl.appendChild(toggleBtn);
    });

    contentEl.textContent = short;
    contentEl.appendChild(toggleBtn);
  } else {
    contentEl.textContent = post.text;
  }

  postEl.appendChild(header);
  postEl.appendChild(divider);
  postEl.appendChild(contentEl);
  return postEl;
}

async function loadRecentPosts() {
  const feed = document.getElementById("posts-feed");

  try {
    const res = await fetch("/api/loadPosts");
    if (!res.ok) throw new Error("load failed");

    const { posts } = await res.json();
    if (!posts?.length) return;

    const currentIds = new Set(
      [...feed.children].map((el) => String(el.dataset.id))
    );
    const newPosts = posts.filter((p) => !currentIds.has(String(p.id)));

    for (let i = newPosts.length - 1; i >= 0; i--) {
      const el = createPostElement(newPosts[i], true);
      feed.insertBefore(el, feed.firstChild);
    }

    document.getElementById("empty-placeholder").style.display =
      feed.children.length === 0 ? "block" : "none";

    while (feed.children.length > 50) {
      feed.removeChild(feed.lastChild);
    }
  } catch (err) {
    console.error("❌ polling error:", err);
  }
}

function startTimeAgoUpdater() {
  setInterval(() => {
    const spans = document.querySelectorAll(".post-time");
    spans.forEach((span) => {
      const raw = span.dataset.timestamp;
      if (!raw) return;
      const date = new Date(raw);
      span.textContent = getRelativeTimeString(date);
    });
  }, 60000);
}

function getNextTransitionDelay() {
  const now = new Date();
  const hour = now.getHours();
  const target = new Date(now);

  if (hour >= 5 && hour < 22) {
    target.setHours(22, 0, 0, 0);
  } else {
    target.setHours(5, 0, 0, 0);
    if (hour >= 22) target.setDate(target.getDate() + 1);
  }

  return target - now;
}

function scheduleTimeTransition() {
  const delay = getNextTransitionDelay();
  setTimeout(() => {
    const prev = document.body.classList.contains("night") ? "night" : "day";
    setThemeBasedOnTime();
    updatePostingAccess();
    const curr = document.body.classList.contains("night") ? "night" : "day";

    if (prev !== curr) playTransition(curr);
    scheduleTimeTransition();
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  setThemeBasedOnTime();
  loadTheme();
  updatePostingAccess();
  updatePostCounter();
  checkPostLimit();
  loadRecentPosts();
  scheduleTimeTransition();

  document.getElementById("submit-button").addEventListener("click", () => {
    const count = getPostCount();
    if (count >= 3) return;

    const input = document.getElementById("thought-input");
    const text = input.value.trim();
    if (text !== "") {
      submitThought(text);
      input.value = "";
      if (window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  });

  setInterval(loadRecentPosts, 15000);
  startTimeAgoUpdater();
});
