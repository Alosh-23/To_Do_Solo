function getCSRFToken() {

    return document.cookie
        .split('; ')
        .find(row =>
            row.startsWith('csrftoken')
        )
        ?.split('=')[1];

}


// ================= TASKS =================

export async function getTasks() {

    const response =
        await fetch("/api/tasks/");

    return await response.json();

}


export async function removeTask(id) {

    await fetch(
        `/api/tasks/${id}/delete/`,
        {

            method: "DELETE",

            credentials: "same-origin",

            headers: {

                "X-CSRFToken":
                    getCSRFToken()

            }

        }
    );

}


// ================= PROFILE =================

export async function saveProfile(state) {

    await fetch(
        "/api/profile/update/",
        {

            method: "POST",

            credentials: "same-origin",

            headers: {

                "Content-Type":
                    "application/json",

                "X-CSRFToken":
                    getCSRFToken()

            },

            body: JSON.stringify({

                xp: state.xp,

                level: state.level,

                streak: state.streak,

                completed_tasks:
                    state.completedTasks,

            })

        }
    );

}


export async function loadProfile() {

    const response =
        await fetch("/api/profile/");

    return await response.json();

}

export async function getLeaderboard() {

    const response =
        await fetch(
            "/api/leaderboard/"
        );

    return await response.json();

}