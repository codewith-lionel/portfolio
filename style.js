let username = "codewith-lionel";
const excludeRepo = "codewith-lionel";
const RESUME_URL =
  "https://drive.google.com/file/d/1J6PX9RK6P_kymoVIed2hG1uR5tuXAMYB/view?usp=sharing";

async function fetchGithub() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();

    // Update UI
    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("name").textContent = user.name || user.login;
    // keep your static bio (don't overwrite from GitHub)
    // set resume link only if element exists — do NOT overwrite manual Drive link if present
    const resumeEl = document.getElementById("resumeBtn");
    if (resumeEl) {
      // prefer explicit RESUME_URL (Drive) — fallback to user's blog/github page
      resumeEl.href = RESUME_URL || user.blog || user.html_url;
      resumeEl.target = "_blank";
      resumeEl.rel = "noopener noreferrer";
    }

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated`
    );
    const repos = await reposRes.json();
    // Exclude forked repos and the portfolio repo itself
    const top6 = repos
      .filter((r) => !r.fork && r.name !== excludeRepo)
      .slice(0, 6);

    document.getElementById("projects-count").textContent = top6.length;
    const grid = document.getElementById("projects-list");
    grid.innerHTML = ""; // Clear previous content
    top6.forEach((repo) => {
      const div = document.createElement("div");
      div.className = "project-card";
      div.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || ""}</p>
        <a href="${repo.html_url}" target="_blank">View Repo</a>`;
      grid.appendChild(div);
    });

    // Aggregate topics from all top6 repos for tech stack
    const allTopics = new Set();
    await Promise.all(
      top6.map(async (repo) => {
        const topicsRes = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/topics`,
          {
            headers: { Accept: "application/vnd.github.mercy-preview+json" },
          }
        );
        const topicsData = await topicsRes.json();
        (topicsData.names || []).forEach((topic) => allTopics.add(topic));
      })
    );

    // Display tech stack
    const bar = document.getElementById("skills");
    bar.innerHTML = "";
    Array.from(allTopics)
      .slice(0, 10)
      .forEach((skill) => {
        const span = document.createElement("span");
        span.textContent = skill;
        bar.appendChild(span);
      });
  } catch (err) {
    console.error(err);
    document.getElementById("projects-list").innerHTML =
      "<p>Could not load projects. Check your GitHub username or network.</p>";
  }
}

// Function to update username and reload projects
function updateGithub() {
  const input = document.getElementById("github-username");
  username = input.value.trim() || "codewith-lionel";
  fetchGithub();
}

// Initial fetch
fetchGithub();

document.querySelectorAll("section").forEach((section) => {
  const reveal = () => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add("visible");
      window.removeEventListener("scroll", reveal);
    }
  };
  window.addEventListener("scroll", reveal);
  reveal();
});

// fallback click handler to ensure resume opens in a new tab
document.addEventListener("click", (e) => {
  const el = e.target.closest("#resumeBtn, #nav-resume");
  if (!el) return;
  const href = el.getAttribute("href");
  if (!href) return;
  // stop other handlers and open explicitly
  e.preventDefault();
  window.open(href, "_blank", "noopener,noreferrer");
});
