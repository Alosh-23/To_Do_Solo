import { state } from "./state.js";
export function updateXPUI() {
    document.getElementById("level").textContent =
        state.level;
    document.getElementById("xp").textContent =
        state.xp;
    const nextLevelXP =
        state.level * 100;
    document.getElementById("next-level-xp").textContent =
        nextLevelXP;
    const progress =
        (state.xp / nextLevelXP) * 100;
    document.getElementById("xp-fill").style.width =
        `${progress}%`;
}
export function updateStreakUI() {
    document.getElementById("streak").textContent =
        state.streak;
}
export function editTask(id) {
    const task = document.getElementById(`task-${id}`);
    console.log("task:", task);
    if (!task) return;
    const title = task.querySelector(".task-title");
    const input = task.querySelector(".edit-input");
    const editBtn = task.querySelector(".btn-edit");
    const saveBtn = task.querySelector(".btn-complete[onclick^='saveTask']") || document.getElementById(`save-btn-${id}`);
    console.log("title =", title);
    console.log("input =", input);
    console.log("editBtn =", editBtn);
    console.log("saveBtn =", saveBtn);
    if (!title || !input || !editBtn || !saveBtn) {
        alert("يوجد عنصر غير موجود، راجع Console");
        return;
    }
    input.hidden = false;
    input.style.display = "block";
    title.style.display = "none";
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    task.classList.add("editing");
    input.value = title.textContent.trim();
    input.focus();
    input.select();
}
export function renderTask(task, home = false) {
    const li = document.createElement("li");
    li.id = `task-${task.id}`;
    li.className = "task";
    li.innerHTML = `
        <span
            id="task-title-${task.id}"
            class="task-title ${task.completed ? "completed" : ""}
        ">
            ${task.title}
        </span>
        <input
            id="edit-input-${task.id}"
            class="edit-input"
            type="text"
            value="${task.title}"
            hidden
        >
        ${
            home
                ? ""
                : `
                <div class="actions">
                    ${
                        !task.completed
                            ? `
                            <button
                                class="btn-small btn-save"
                                onclick="completeTask(${task.id})"

                            >
                                ✔
                            </button>
                            `
                            : ""
                    }
                    <button
                        id="edit-btn-${task.id}"
                        class="btn-small btn-edit"
                        type="button"
                        onclick="editTask(${task.id})"
                    >
                        ✏
                    </button>
                    <button
                        id="save-btn-${task.id}"
                        class="btn-small btn-complete"
                        type="button"
                        onclick="saveTask(${task.id})"
                        style="display:none;"
                    >
                        💾
                    </button>
                    <button
                        class="btn-small btn-delete"
                        onclick="deleteTask(${task.id})"
                    >
                        🗑
                    </button>
                </div>
                `
        }
    `;
    return li;
}
export function showXPPopup(amount) {
    const popup =
        document.createElement("div");
    popup.classList.add("xp-popup");
    popup.textContent =
        `+${amount} XP ✨`;
    document
        .getElementById(
            "xp-popup-container"
        )
        .appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 1500);
}
export function showAchievementPopup(title) {
    const popup =
        document.createElement("div");
    popup.classList.add(
        "achievement-popup"
    );
    popup.innerHTML = `
        <div class="achievement-title">
            🏆 Achievement Unlocked
        </div>
        <div class="achievement-name">
            ${title}
        </div>
    `;
    document
        .getElementById(
            "achievement-container"
        )
        .appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);
}
export function triggerConfetti() {
    confetti({
        particleCount: 120,
        spread: 90,
        origin: {
            y: 0.6
        }

    });
}
export function playLevelUpSound() {
    const sound =
        new Audio("/static/sounds/level-up.mp3");
    sound.play();
}
export function renderMissions() {
    const container =
        document.getElementById(
            "missions-list"
        );
    container.innerHTML = "";
    state.missions.forEach(mission => {
        container.innerHTML += `
            <div class="mission">
                <strong>
                    ${mission.title}
                </strong>
                <p>
                    ${mission.progress}
                    /
                    ${mission.goal}
                </p>
            </div>
        `;
    });
}
export function renderQuests() {
    const container =
        document.getElementById(
            "quests-list"
        );
    container.innerHTML = "";
    state.dailyQuests.forEach(quest => {
        container.innerHTML += `
            <div class="
            quest-item
            ${quest.completed ? 'done' : ''}
            ">
                <strong>
                    ${quest.title}
                </strong>
                <p>
                    ${quest.progress}
                    /
                    ${quest.goal}
                </p>
            </div>
        `;
    });
}
export function renderLeaderboard(
    users
) {
    const container =
        document.getElementById(
            "leaderboard-list"
        );
    container.innerHTML = "";
    users.forEach((user, index) => {
        container.innerHTML += `
            <div class="leaderboard-user">
                <strong>
                    #${index + 1}
                </strong>
                ${user.username}
                — Lv.${user.level}
                — ${user.xp} XP
            </div>
        `;
    });
}
window.editTask = editTask;