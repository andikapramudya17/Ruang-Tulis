const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");
const navMenu = document.getElementById("navMenu");
const menuToggle = document.getElementById("menuToggle");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const filterButtons = document.querySelectorAll(".filter-btn");
const archiveItems = document.querySelectorAll(".archive-group li");

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(pageId);

  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.classList.remove("active");

    if (link.dataset.page === pageId) {
      link.classList.add("active");
    }
  });

  navMenu.classList.remove("open");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const pageId = link.dataset.page;

    if (pageId) {
      event.preventDefault();
      history.pushState(null, "", `#${pageId}`);
      showPage(pageId);
    }
  });
});

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeIcon.textContent = "🌙";
  }

  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    archiveItems.forEach((item) => {
      const category = item.dataset.category;

      if (filter === "all" || category === filter) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  });
});

window.addEventListener("popstate", () => {
  const pageId = window.location.hash.replace("#", "") || "home";
  showPage(pageId);
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? "dark" : "light");
  }

  const pageId = window.location.hash.replace("#", "") || "home";
  showPage(pageId);
});

let posts = [];

async function loadPosts() {
  try {
    const response = await fetch("posts.json");
    posts = await response.json();

    renderLatestPosts();
    renderArchive();
  } catch (error) {
    console.error("Gagal memuat posts.json:", error);
  }
}

function renderLatestPosts() {
  const latestPosts = document.getElementById("latestPosts");

  if (!latestPosts) return;

  latestPosts.innerHTML = posts
    .slice(0, 3)
    .map((post, index) => {
      return `
        <article class="post-card">
          <p class="post-meta">${formatDate(post.date)} · ${post.category}</p>
          <h3>
            <a href="#article-${index}" data-post-index="${index}">
              ${post.title}
            </a>
          </h3>
          <p>${post.excerpt}</p>
          <a href="#article-${index}" class="read-more" data-post-index="${index}">
            Baca selengkapnya →
          </a>
        </article>
      `;
    })
    .join("");

  attachPostLinks();
}

function renderArchive() {
  const archiveList = document.getElementById("archiveList");

  if (!archiveList) return;

  archiveList.innerHTML = `
    <div class="archive-group">
      <h2>Semua Tulisan</h2>
      <ul>
        ${posts
          .map((post, index) => {
            return `
              <li data-category="${getCategorySlug(post.category)}">
                <span>${shortDate(post.date)}</span>
                <a href="#article-${index}" data-post-index="${index}">
                  ${post.title}
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
    </div>
  `;

  attachPostLinks();
}

function attachPostLinks() {
  document.querySelectorAll("[data-post-index]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();

      const index = link.dataset.postIndex;
      history.pushState(null, "", `#article-${index}`);

      await loadArticle(index);
      showPage("article");
    });
  });
}

async function loadArticle(index) {
  const articleContent = document.getElementById("articleContent");
  const post = posts[index];

  if (!articleContent || !post) return;

  try {
    const response = await fetch(post.file);
    const markdown = await response.text();
    const html = marked.parse(markdown);

    articleContent.innerHTML = `
      <a href="#home" class="back-link" data-page="home">← Kembali ke Home</a>

      <p class="eyebrow">${post.category}</p>
      <h1>${post.title}</h1>

      <p class="article-meta">
        ${formatDate(post.date)} · Ditulis oleh Ruang Tulis
      </p>

      ${html}
    `;

    const backLink = articleContent.querySelector("[data-page='home']");
    if (backLink) {
      backLink.addEventListener("click", (event) => {
        event.preventDefault();
        history.pushState(null, "", "#home");
        showPage("home");
      });
    }
  } catch (error) {
    articleContent.innerHTML = `
      <a href="#home" class="back-link" data-page="home">← Kembali ke Home</a>
      <p>Artikel gagal dimuat.</p>
    `;
    console.error("Gagal memuat artikel:", error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function shortDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short"
  });
}

function getCategorySlug(category) {
  const text = category.toLowerCase();

  if (text.includes("weekly")) return "weekly";
  if (text.includes("monthly")) return "monthly";
  return "personal";
}

loadPosts();
