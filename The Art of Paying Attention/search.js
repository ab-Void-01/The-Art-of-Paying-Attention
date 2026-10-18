/* =====================================================
   SEARCH PAGE
   Fetches posts.json once, then filters client-side as
   the person types — no backend, no rebuild needed when
   posts.json grows. Requires the site to be served over
   http(s); fetch() won't resolve a relative JSON path
   when the page is opened directly as a file:// URL.
===================================================== */

const searchInput = document.getElementById("search-input");
const resultsRoot = document.getElementById("search-results");
const emptyState = document.getElementById("search-empty");
const metaEl = document.getElementById("search-meta");

if (searchInput && resultsRoot) {
  let allPosts = [];
  let loaded = false;

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  });

  const renderCard = (post) => {
    const d = new Date(post.date);
    return `
      <article class="card reveal-card" data-category="${post.category}">
        <a href="${post.url}" class="image-wrap">
          <img src="${post.image}" alt="${post.title}" />
        </a>
        <p class="meta">${post.categoryLabel} <span>•</span> ${post.readTime}</p>
        <h3><a href="${post.url}" class="card-title-link">${post.title}</a></h3>
        <p class="author">
          By <strong>The Void</strong>
          <time datetime="${post.date}">${dateFormatter.format(d)}</time>
        </p>
      </article>`;
  };

  const runSearch = (query) => {
    const q = query.trim().toLowerCase();

    if (!q) {
      resultsRoot.innerHTML = "";
      resultsRoot.hidden = true;
      emptyState.hidden = true;
      metaEl.textContent = allPosts.length
        ? `${allPosts.length} stories published so far.`
        : "";
      return;
    }

    const matches = allPosts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.categoryLabel,
        post.category,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    resultsRoot.hidden = false;
    resultsRoot.innerHTML = matches.map(renderCard).join("");
    emptyState.hidden = matches.length > 0;
    metaEl.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? "result" : "results"} for “${query.trim()}.”`
      : `No results for “${query.trim()}.”`;
  };

  fetch("posts.json")
    .then((res) => {
      if (!res.ok) throw new Error("Could not load posts.json");
      return res.json();
    })
    .then((posts) => {
      allPosts = Array.isArray(posts) ? posts : [];
      loaded = true;
      metaEl.textContent = allPosts.length
        ? `${allPosts.length} stories published so far.`
        : "";
      resultsRoot.hidden = true;

      const hashMatch = location.hash.match(/^#q=(.+)$/);
      if (hashMatch) {
        const q = decodeURIComponent(hashMatch[1]);
        searchInput.value = q;
        runSearch(q);
      }
    })
    .catch(() => {
      metaEl.textContent = "Search couldn't load right now — try refreshing.";
    });

  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const value = e.target.value;
    debounceTimer = setTimeout(() => {
      if (!loaded) return;
      if (value.trim()) {
        history.replaceState(null, "", `#q=${encodeURIComponent(value.trim())}`);
      } else {
        history.replaceState(null, "", location.pathname);
      }
      runSearch(value);
    }, 150);
  });
}
