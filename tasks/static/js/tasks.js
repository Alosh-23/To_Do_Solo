import { addXP } from "./xp.js";

import { state } from "./state.js";

import {checkAchievements} from "./achievements.js";

import {updateStreak} from "./streak.js";

import {updateMissionProgress,renderMissions} from "./missions.js";

import { loadState } from "./storage.js";

import {loadProfile,getLeaderboard,getTasks,removeTask} from "./api.js";

import {renderLeaderboard} from "./ui.js";

import {generateDailyQuests,checkDailyReset} from "./quests.js";

import {renderQuests} from "./ui.js";

import {updateQuestProgress} from "./quests.js";

import "./navigation.js";

import { updateXPUI, renderTask, editTask } from "./ui.js";

function getCSRFToken() {
    return document.querySelector(
        "[name=csrfmiddlewaretoken]"
    ).value;
}

// ================= START APP =================

async function initializeApp() {

    loadState();

    await syncProfile();

    renderMissions();

    checkDailyReset();
    
    renderQuests();

    generateDailyQuests();

    await loadTasks();

    const users =
        await getLeaderboard();

    renderLeaderboard(users);

}


// ================= PROFILE =================

async function syncProfile() {

    try {

        const profile =
            await loadProfile();

        state.xp =
            profile.xp;

        state.level =
            profile.level;

        state.streak =
            profile.streak;

        state.completedTasks =
            profile.completed_tasks;

        updateXPUI();

    }

    catch (error) {

        console.error(
            "Profile sync failed:",
            error
        );

    }

}


// ================= LOAD TASKS =================

async function loadTasks() {

    const tasks =
        await getTasks();

    const taskList =
        document.getElementById(
            "task-list"
        );

    taskList.innerHTML = "";

    if (tasks.length === 0) {

    taskList.innerHTML = `

        <div class="empty-state">
            🚀 No tasks yet
        </div>

    `;

} 

else {

    // عرض جميع المهام في صفحة Tasks
    tasks.forEach(task => {

        taskList.appendChild(
            renderTask(task)
        );

    });

}

// ================= HOME TASKS =================

const homeList =
    document.getElementById("home-task-list");

if (homeList) {

    homeList.innerHTML = "";

    const activeTasks =
        tasks.filter(task => !task.completed)
             .slice(0, 5);

    if (activeTasks.length === 0) {

        homeList.innerHTML = `
            <div class="empty-state">
                🎉 All tasks completed
            </div>
        `;

    } else {

        activeTasks.forEach(task => {

            homeList.appendChild(
                renderTask(task, true)
            );

        });

    }

}

}


// ================= DELETE TASK =================

async function deleteTask(id) {

    const task =
        document.getElementById(
            `task-${id}`
        );

    task.classList.add("loading");

    task.classList.add("removing");

    setTimeout(async () => {

        await removeTask(id);

        task.remove();

        if (
            document.querySelectorAll(".task")
            .length === 0
        ) {

            document.getElementById(
                "task-list"
            ).innerHTML = `

                <div class="empty-state">
                    🚀 No tasks yet
                </div>

            `;

        }

    }, 350);

}


// ================= SAVE TASK =================

async function saveTask(id) {

    const task = document.getElementById(`task-${id}`);

    const title = task.querySelector(".task-title");

    const input = task.querySelector(".edit-input");

    const editBtn = task.querySelector(`#edit-btn-${id}`);

    const saveBtn = task.querySelector(`#save-btn-${id}`);

    try {

        const response = await fetch(`/api/tasks/${id}/`, {

            method: "PUT",

            credentials: "same-origin",

            headers: {

                "Content-Type": "application/json",

                "X-CSRFToken": getCSRFToken()

            },

            body: JSON.stringify({

                title: input.value.trim()

            })

        });

        if (!response.ok) {

            throw new Error("Save failed");

        }

        const data = await response.json();

        title.textContent = data.title;

        title.style.display = "inline";

        input.hidden = true;

        input.style.display = "none";

        editBtn.style.display = "inline-block";

        saveBtn.style.display = "none";

        task.classList.remove("editing");

        task.classList.add("success");

        setTimeout(() => {

            task.classList.remove("success");

        }, 1000);

    }

    catch(error){

        console.error(error);

        task.classList.add("error");

        setTimeout(()=>{

            task.classList.remove("error");

        },1000);

    }

}



// ================= ADD TASK =================

document.getElementById(
    "task-form"
).addEventListener(
    "submit",
    function(e) {

        e.preventDefault();

        const titleInput =
            document.querySelector(
                'input[name="title"]'
            );

        fetch("/", {

            method: "POST",

            credentials:
                "same-origin",

            headers: {

                "Content-Type":
                    "application/x-www-form-urlencoded",

                "X-CSRFToken":
                    getCSRFToken()

            },

            body:
                `title=${encodeURIComponent(titleInput.value)}`

        })

        .then(() => {

            location.reload();

        });

    }
);


// ================= COMPLETE TASK =================

async function completeTask(id) {

    await fetch(`/complete/${id}/`);

    addXP(10);

    state.completedTasks++;

    checkAchievements();

    updateStreak();

    updateMissionProgress();

    updateQuestProgress("tasks");

    loadTasks();

}


// ================= GLOBAL =================

window.completeTask = completeTask;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.saveTask = saveTask;

// ================= INITIALIZE =================

initializeApp(); 