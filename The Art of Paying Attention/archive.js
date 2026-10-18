/* =====================================================
   ARCHIVE PAGE
   Fetches posts.json and renders every post grouped by
   month, newest first. Requires the site to be served
   over http(s) — fetch() of a local JSON file won't work
   when opened directly as a file:// URL.
===================================================== */

const archiveRoot = document.getElementById("archive-groups");

if (archiveRoot) {
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  });

  fetch("posts.json")
    .then((res) => {
      if (!res.ok) throw new Error("Could not load posts.json");
      return res.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts) || posts.length === 0) {
        archiveRoot.innerHTML =
          '<p class="archive-empty">Nothing in the archive yet.</p>';
        return;
      }

      const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      const groups = new Map();
      sorted.forEach((post) => {
        const d = new Date(post.date);
        const key = monthFormatter.format(d);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(post);
      });

      const html = Array.from(groups.entries())
        .map(([month, posts]) => {
          const items = posts
            .map((post) => {
              const d = new Date(post.date);
              return `
                <li class="archive-item">
                  <time datetime="${post.date}">${dayFormatter.format(d)}</time>
                  <a href="${post.url}">${post.title}</a>
                  <span class="archive-cat">${post.categoryLabel || ""}</span>
                </li>`;
            })
            .join("");
          return `
            <div class="archive-group">
              <h2>${month}</h2>
              <ul class="archive-list">${items}</ul>
            </div>`;
        })
        .join("");

      archiveRoot.innerHTML = html;
    })
    .catch(() => {
      archiveRoot.innerHTML =
        '<p class="archive-empty">The archive couldn\'t be loaded right now — try refreshing.</p>';
    });
}
