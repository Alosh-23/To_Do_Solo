import { state } from "./state.js";
import { saveState } from "./storage.js";

export function editTask(id) {
    const title = document.getElementById(`task-title-${id}`);
    const input = document.getElementById(`edit-input-${id}`);
    const saveBtn = document.getElementById(`save-btn-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);

    if (!title || !input || !saveBtn || !editBtn) {
        console.error("Task elements not found:", id);
        return;
    }

    title.style.display = "none";
    input.style.display = "inline-block";
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    input.focus();
    input.select();
}

export function updateXPUI() {
    const xpElement = document.getElementById("xp");
    const levelElement = document.getElementById("level");
    const nextLevelElement = document.getElementById("next-level-xp");
    const xpFill = document.getElementById("xp-fill");

    if (xpElement) xpElement.textContent = state.xp;
    if (levelElement) levelElement.textContent = state.level;
    if (nextLevelElement) nextLevelElement.textContent = state.level * 100;
    if (xpFill) {
        const percent = Math.min(100, (state.xp / (state.level * 100)) * 100);
        xpFill.style.width = `${percent}%`;
    }
}

export function triggerConfetti() {
    const container = document.getElementById("xp-popup-container");
    if (!container) return;
    const burst = document.createElement("div");
    burst.textContent = "✨";
    burst.style.position = "absolute";
    burst.style.top = "8px";
    burst.style.right = "8px";
    burst.style.fontSize = "24px";
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 1200);
}

export function playLevelUpSound() {
    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
        console.log("Sound unavailable", error);
    }
}

export function showXPPopup(amount) {
    const container = document.getElementById("xp-popup-container");
    if (!container) return;
    const popup = document.createElement("div");
    popup.className = "mini-game-card";
    popup.textContent = `+${amount} XP`;
    popup.style.position = "fixed";
    popup.style.right = "24px";
    popup.style.bottom = "24px";
    popup.style.zIndex = "1200";
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1400);
}

export function showAchievementPopup(title) {
    const container = document.getElementById("achievement-container");
    if (!container) return;
    const popup = document.createElement("div");
    popup.className = "feature-card";
    popup.textContent = title;
    popup.style.marginTop = "10px";
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1800);
}

export function updateStreakUI() {
    const container = document.getElementById("achievement-container");
    if (!container) return;
    const existing = document.getElementById("streak-banner");
    if (existing) existing.remove();
    const banner = document.createElement("div");
    banner.id = "streak-banner";
    banner.className = "feature-card";
    banner.innerHTML = `<strong>🔥 Streak:</strong> ${state.streak} days`;
    container.appendChild(banner);
}

export function renderQuests() {
    const questsList = document.getElementById("quests-list");
    if (!questsList) return;
    const quests = state.dailyQuests || [];
    if (!quests.length) {
        questsList.innerHTML = '<div class="empty-state">No daily quests yet.</div>';
        return;
    }
    questsList.innerHTML = quests.map(q => `
        <div class="feature-card" style="margin-bottom:10px;">
            <strong>${q.title}</strong>
            <div>${q.progress || 0}/${q.goal}</div>
            <div>${q.completed ? "Completed" : "In progress"}</div>
        </div>
    `).join("");
}

export function renderMissions() {
    const missionsList = document.getElementById("missions-list");
    if (!missionsList) return;
    const missions = state.missions || [];
    missionsList.innerHTML = missions.map(mission => `
        <div class="feature-card" style="margin-bottom:10px;">
            <strong>${mission.title}</strong>
            <div>${mission.progress || 0}/${mission.goal}</div>
        </div>
    `).join("");
}

export function renderLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return;
    const rows = [
        { username: "You", level: state.level, xp: state.xp },
        { username: "Nova", level: 3, xp: 210 },
        { username: "Ava", level: 2, xp: 160 }
    ];
    leaderboardList.innerHTML = rows.map((entry, index) => `
        <div class="feature-card" style="margin-bottom:10px;">
            <strong>#${index + 1}</strong> ${entry.username} · Lv ${entry.level} · ${entry.xp} XP
        </div>
    `).join("");
}

export function renderAchievements() {
    const container = document.getElementById("achievement-container");
    if (!container) return;
    const list = state.achievements || [];
    container.innerHTML = list.length ? list.map(item => `<div class="feature-card" style="margin-bottom:8px;">${item}</div>`).join("") : '<div class="empty-state">No achievements yet.</div>';
}

export function renderDashboard() {
    updateXPUI();
    renderQuests();
    renderMissions();
    renderLeaderboard();
    renderAchievements();
    updateStreakUI();
}

export function saveDashboardState() {
    saveState();
}
