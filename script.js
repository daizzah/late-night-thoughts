const isTesting = false;
let latestPostTime = null;
const allThemes = [
  "something you never said",
  "a memory you keep coming back to",
  "the thought that always hits at 2am",
  "one truth you try to ignore",
  "what you wish they knew",
  "something that changed you quietly",
  "a time you felt truly seen",
  "a moment you keep replaying",
  "the version of you that no one meets",
  "something that still lingers",
  "what haunts you softly",
  "the goodbye that didn’t feel real",
  "a lie you told to protect someone",
  "if you could go back, you’d…",
  "something that broke you but no one noticed",
  "something you miss but can’t explain",
  "a scent that brings you somewhere",
  "a song that still feels like a person",
  "the most peaceful memory you have",
  "when did time feel like it stopped?",
  "something you’re scared to forget",
  "a detail you always notice",
  "something they said that stuck",
  "a habit you didn’t realize was from them",
  "a place that holds meaning",
  "your favorite moment that felt small at the time",
  "one thing you’re thankful for",
  "something you’re learning to accept",
  "something you’ve healed from",
  "the kindest thing someone’s ever said to you",
  "a version of you you’re becoming",
  "the last time you felt truly proud",
  "a moment you chose yourself",
  "when you realized you’ve grown",
  "what feels like home lately",
  "something that reminded you of joy",
  "your personal definition of peace",
  "if today was a song, what would it be?",
  "what made you laugh today?",
  "a weird dream you had",
  "your most recent intrusive thought",
  "something small that made you smile",
  "a random realization u had",
  "something u said in ur head but not out loud",
  "the vibe of your day in 3 words",
  "a weird memory that resurfaced",
  "how are u different now?",
  "what would the younger you think of you today?",
  "something you only admit in your head",
  "if someone wrote about u, what would they say?",
  "how do u define love?",
  "something you wish you believed",
  "a label you feel but don’t say out loud",
  "the part of you people don’t get",
  "who are you when no one's around?",
  "what part of u is still hiding?",
  "something you never got to say",
  "the moment it started to change",
  "a feeling you miss",
  "what you needed to hear",
  "something that meant everything at the time",
  "i knew it was over when…",
  "a thought you always avoid",
  "if you could relive one moment",
  "the version of you from a year ago",
  "a goodbye that didn’t feel like one",
  "what you still wonder about",
  "something you never told anyone",
  "the thing that hurt more than it should’ve",
  "your quietest regret",
  "a moment you realized you’ve changed",
  "what peace would look like for you",
  "the thing you wish you’d said back",
  "if you could visit your past self",
];
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const stars = document.getElementById("stars-background");
  stars.style.backgroundPositionY = `${scrolled * 0.1}px`;
});
function setThemeBasedOnTime() {
  const body = document.body;
  const hour = new Date().getHours();
  let mode = hour >= 5 && hour < 22 ? "day" : "night";

  if (mode === "day") {
    body.classList.add("day");
    body.classList.remove("night");
  } else {
    body.classList.add("night");
    body.classList.remove("day");
  }
  const starsBackground = document.getElementById("stars-background");
  starsBackground.style.display = mode === "day" ? "none" : "block";
}
function getDateStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}
function updatePostingAccess() {
  const body = document.body;
  const postForm = document.getElementById("post-form");
  const thoughtInput = document.getElementById("thought-input");
  const submitButton = document.getElementById("submit-button");
  const relatesCheckbox = document.getElementById("relates-checkbox");
  const lockedMessage = document.getElementById("locked-message");
  const themeSection = document.getElementById("theme");
  const themeTextEl = document.querySelector(".theme-text");
  if (!themeTextEl) return;
  const now = new Date();
  const hour = now.getHours();
  const mode = hour >= 5 && hour < 22 ? "day" : "night";

  if (mode === "day") {
    thoughtInput.disabled = !0;
    submitButton.disabled = !0;
    relatesCheckbox.disabled = !0;
    submitButton.style.cursor = "not-allowed";
    body.classList.add("form-locked");
    lockedMessage.classList.add("show");
    themeSection.style.display = "none";
    themeTextEl.textContent = "";
  } else {
    thoughtInput.disabled = !1;
    submitButton.disabled = !1;
    relatesCheckbox.disabled = !1;
    submitButton.style.cursor = "pointer";
    body.classList.remove("form-locked");
    lockedMessage.classList.remove("show");
    themeSection.style.display = "block";
    const storedTheme = localStorage.getItem("tonightTheme");
    if (storedTheme) {
      themeTextEl.textContent = storedTheme;
    } else {
      const newTheme = getTonightTheme();
      localStorage.setItem("tonightTheme", newTheme);
      themeTextEl.textContent = newTheme;
    }
  }
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
function toggleDevMode() {
  devForcedMode = devForcedMode === "night" ? "day" : "night";
  if (devForcedMode === "night") {
    localStorage.removeItem(getTodayKey());
    localStorage.removeItem("lastPostDate");
    localStorage.removeItem("tonightTheme");
    const newTheme = getTonightTheme();
    localStorage.setItem("tonightTheme", newTheme);
  }
  playTransition(devForcedMode);
  setThemeBasedOnTime();
  updatePostingAccess();
  updatePostCounter();
  checkPostLimit();
  loadRecentPosts();
}

function playTransition(mode) {
  const overlay = document.getElementById("transition-overlay");
  const orb = document.getElementById("sky-orb");
  const title = document.getElementById("transition-title");
  const sub = document.getElementById("transition-sub");
  if (mode === "night") {
    orb.innerText = "🌙";
    title.innerText = "good night";
    sub.innerText = "time to wind down...💤";
  } else {
    orb.innerText = "🌞";
    title.innerText = "good morning";
    sub.innerText = "it’s a new day!";
  }
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 2500);
}
function updateLockedMessage(currentMode) {
  const lockedMessage = document.getElementById("locked-message");
  if (currentMode === "day") {
    lockedMessage.innerHTML = `🔒 posting opens at 10PM`;
  } else {
    lockedMessage.innerHTML = `🕐 posting is open until 5AM`;
  }
}
function getTodayKey() {
  const now = new Date();
  return `postCount-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}
function getPostCount() {
  const key = getTodayKey();
  return parseInt(localStorage.getItem(key)) || 0;
}
function updatePostCounter() {
  const count = getPostCount();
  const counter = document.getElementById("post-counter");
  counter.textContent = `${count}/3 shared`;
}
function incrementPostCount() {
  const key = getTodayKey();
  const current = getPostCount();
  localStorage.setItem(key, current + 1);
  updatePostCounter();
}
function checkPostLimit() {
  const count = getPostCount();
  const thoughtInput = document.getElementById("thought-input");
  const submitButton = document.getElementById("submit-button");
  const relatesCheckbox = document.getElementById("relates-checkbox");
  const finalMessage = document.getElementById("final-message");
  const postForm = document.getElementById("post-form");
  const key = getTodayKey();
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 0);
  }
  updatePostCounter();
  if (count >= 3) {
    thoughtInput.disabled = !0;
    submitButton.disabled = !0;
    relatesCheckbox.disabled = !0;
    submitButton.style.cursor = "not-allowed";
    const body = document.body;
    if (body.classList.contains("night")) {
      finalMessage.classList.add("show");
    } else {
      finalMessage.classList.remove("show");
    }
    postForm.classList.add("post-limit-locked");
  }
}
async function submitThought(text) {
  const themeText = document.querySelector(".theme-text")?.textContent;
  const checkbox = document.getElementById("relates-checkbox");

  const postData = {
    text,
    theme: checkbox.checked ? themeText : null,
    timestamp: new Date().toISOString(),
  };

  console.log("📤 sending POST:", postData);

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    if (!res.ok) throw new Error("submit failed");

    const result = await res.json();
    console.log("✅ post submitted:", result);

    incrementPostCount();
    checkPostLimit();
    loadRecentPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (text.length <= 250) return text;
  return text.slice(0, 250) + "...";
}
function createPostElement(post, animate = true) {
  const postElement = document.createElement("div");
  postElement.dataset.id = post.id;
  postElement.classList.add("post");

  if (animate) {
    requestAnimationFrame(() => {
      postElement.classList.add("visible");
    });
  } else {
    postElement.classList.add("visible");
  }

  const created = new Date(post.created_at);
  const timeString = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = created.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const timestampText = `${dateString} | ${timeString}`;

  const header = document.createElement("div");
  header.classList.add("post-header");
  header.innerHTML = `
    ${
      post.theme
        ? `<span class="post-theme">${post.theme}</span>`
        : `<span class="post-theme" style="visibility:hidden;">no theme</span>`
    }
    <span class="post-time">${timestampText}</span>
  `;

  const divider = document.createElement("hr");
  divider.className = "post-divider";

  const contentEl = document.createElement("p");
  contentEl.className = "post-content";
  const fullText = post.text;
  const words = fullText.split(" ");
  const truncateLimit = 40;

  if (words.length > truncateLimit) {
    const shortText = words.slice(0, truncateLimit).join(" ") + "...";
    let expanded = false;
    contentEl.textContent = shortText;
    const toggleBtn = document.createElement("span");
    toggleBtn.textContent = "read more";
    toggleBtn.className = "read-more";
    toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      contentEl.textContent = expanded ? fullText : shortText;
      toggleBtn.textContent = expanded ? "show less" : "read more";
      contentEl.appendChild(toggleBtn);
    });
    contentEl.appendChild(toggleBtn);
  } else {
    contentEl.textContent = fullText;
  }

  postElement.appendChild(header);
  postElement.appendChild(divider);
  postElement.appendChild(contentEl);
  return postElement;
}

async function loadRecentPosts() {
  const postsFeed = document.getElementById("posts-feed");

  const existingEls = [...postsFeed.children];
  const currentIds = new Set(existingEls.map((el) => el.dataset.id));

  try {
    const res = await fetch("/api/loadPosts");
    if (!res.ok) throw new Error("failed");

    const { posts } = await res.json();
    if (!posts || posts.length === 0) return;

    let updated = false;

    for (const post of posts) {
      if (!currentIds.has(post.id)) {
        const el = createPostElement(post, true);
        postsFeed.insertBefore(el, postsFeed.firstChild);
        updated = true;
      }
    }

    existingEls.forEach((el) => el.classList.add("visible"));

    if (updated) {
      while (postsFeed.children.length > 50) {
        postsFeed.removeChild(postsFeed.lastChild);
      }
    }
  } catch (err) {
    console.error("❌ polling error:", err);
  }
}

function getUsedThemes() {
  return JSON.parse(localStorage.getItem("usedThemes") || "[]");
}
function markThemeUsed(theme) {
  const used = getUsedThemes();
  used.push(theme);
  localStorage.setItem("usedThemes", JSON.stringify(used));
}
function getTonightTheme() {
  const used = getUsedThemes();
  const unused = allThemes.filter((t) => !used.includes(t));
  if (unused.length === 0) {
    localStorage.removeItem("usedThemes");
    return getTonightTheme();
  }
  const randomIndex = Math.floor(Math.random() * unused.length);
  const chosen = unused[randomIndex];
  markThemeUsed(chosen);
  return chosen;
}
function getNextTransitionDelay() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  let target = new Date(now);

  if (hour >= 5 && hour < 22) {
    target.setHours(22, 0, 0, 0);
  } else {
    target.setHours(5, 0, 0, 0);
    if (hour >= 22) target.setDate(target.getDate() + 1);
  }

  const diff = target - now;
  return diff;
}

function scheduleTimeTransition() {
  const delay = getNextTransitionDelay();
  setTimeout(() => {
    console.log("🔁 time window changed, updating...");

    const prevMode = document.body.classList.contains("night")
      ? "night"
      : "day";

    setThemeBasedOnTime();
    updatePostingAccess();

    const newMode = document.body.classList.contains("night") ? "night" : "day";
    if (newMode !== prevMode) {
      playTransition(newMode);
    }

    scheduleTimeTransition();
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded triggered");
  setThemeBasedOnTime();
  updatePostingAccess();
  updatePostCounter();
  checkPostLimit();
  loadRecentPosts();
  scheduleTimeTransition();

  document.getElementById("submit-button").addEventListener("click", () => {
    const count = getPostCount();
    if (count >= 3) return;
    const input = document.getElementById("thought-input");
    const thought = input.value.trim();
    if (thought !== "") {
      submitThought(thought);
      input.value = "";
      if (window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  });
  setInterval(() => {
    loadRecentPosts();
  }, 1000);
});
