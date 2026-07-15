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

    const response = await fetch(`/api/tasks/${id}/delete/`, {

        method: "DELETE",

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest"
        }

    });

    console.log("Status:", response.status);

    const text = await response.text();

    console.log(text);

    return response;

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