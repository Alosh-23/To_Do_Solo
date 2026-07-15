import "./navigation.js";

import {
    getTasks,
    removeTask
} from "./api.js";

import {
    editTask
} from "./ui.js";

function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

// ================= LOAD TASKS =================

async function loadTasks() {

    const taskList = document.getElementById("task-list");

    if (!taskList) return;

    const tasks = await getTasks();

    taskList.innerHTML = "";

    tasks.forEach(task => {

        taskList.innerHTML += `
            <div class="task" id="task-${task.id}">

                <span
                    id="task-title-${task.id}"
                    class="task-title ${task.completed ? "completed" : ""}">
                    ${task.title}
                </span>

                <input
                    id="edit-input-${task.id}"
                    class="edit-input"
                    type="text"
                    value="${task.title}"
                    style="display:none;"
                >

                <div class="actions">

                    ${
                        !task.completed
                        ? `
                        <button
                            class="btn-small btn-complete"
                            onclick="completeTask(${task.id})">
                            ✔
                        </button>
                        `
                        : ""
                    }

                    <button
                        id="edit-btn-${task.id}"
                        class="btn-small btn-edit"
                        onclick="editTask(${task.id})">
                        ✏
                    </button>

                    <button
                        id="save-btn-${task.id}"
                        class="btn-small btn-save"
                        onclick="saveTask(${task.id})"
                        style="display:none;">
                        💾
                    </button>

                    <button
                        class="btn-small btn-delete"
                        onclick="deleteTask(${task.id})">
                        🗑
                    </button>

                </div>

            </div>
        `;
    });

}

// ================= SAVE =================

async function saveTask(id) {

    const input = document.getElementById(`edit-input-${id}`);
    const title = document.getElementById(`task-title-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);
    const saveBtn = document.getElementById(`save-btn-${id}`);

    try {

        const response = await fetch(`/api/tasks/${id}/update/`, {

            method: "PUT",

            credentials: "same-origin",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },

            body: JSON.stringify({
                title: input.value
            })

        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        title.textContent = data.title;
        title.style.display = "inline";
        input.style.display = "none";
        editBtn.style.display = "inline-block";
        saveBtn.style.display = "none";

    }

    catch (error) {

        console.error(error);
        alert(error);

    }

}

// ================= COMPLETE =================

async function completeTask(id) {

    try {

        await fetch(`/complete/${id}/`);

        await loadTasks();

    }

    catch (error) {

        console.error(error);

        alert("Failed to complete task");

    }

}

// ================= DELETE =================

async function deleteTask(id) {

    if (!confirm("Delete this task?")) return;

    try {

        await removeTask(id);

        await loadTasks();

    }

    catch (error) {

        console.error(error);

        alert("Failed to delete task");

    }

}

// ================= ADD =================

document.getElementById("task-form").addEventListener("submit", async function (e) {

    e.preventDefault();

    const input =
        document.querySelector('input[name="title"]');

    await fetch("/", {

        method: "POST",

        headers: {

            "Content-Type": "application/x-www-form-urlencoded",

            "X-CSRFToken": getCSRFToken()

        },

        body: `title=${encodeURIComponent(input.value)}`

    });

    input.value = "";

    await loadTasks();

});

// ================= GLOBAL =================

window.editTask = editTask;
window.saveTask = saveTask;
window.completeTask = completeTask;
window.deleteTask = deleteTask;

// ================= START =================

loadTasks();