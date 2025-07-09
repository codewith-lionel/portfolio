
const username = "codewith-lionel"; // Or any other GitHub username
fetchGithub();

async function fetchGithub() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();

    // Update UI
    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("name").textContent = user.name || user.login;
    document.getElementById("bio").textContent = user.bio || "";
    document.getElementById("resumeBtn").href = user.blog || user.html_url;

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated`
    );
    const repos = await reposRes.json();
    const top6 = repos.filter((r) => !r.fork).slice(0, 6);

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

    // Get topics from the first repo (if it exists)
    if (top6[0]) {
      const topicsRes = await fetch(
        `https://api.github.com/repos/${username}/${top6[0].name}/topics`,
        {
          headers: { Accept: "application/vnd.github.mercy-preview+json" },
        }
      );
      const topicsData = await topicsRes.json();
      const bar = document.getElementById("skills");
      bar.innerHTML = ""; // Clear previous skills
      topicsData.names?.slice(0, 10).forEach((skill) => {
        const span = document.createElement("span");
        span.textContent = skill;
        bar.appendChild(span);
      });
    }
  } catch (err) {
    console.error(err);
    alert("Failed to load GitHub data.");
  }
}
