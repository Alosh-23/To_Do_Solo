/**
 * ==========================================================
 * TO DO SOLO
 * GLOBAL APP STATE
 * ==========================================================
 */

const AppState = {

    user: {
        xp: 0,
        level: 1,
        streak: 0,
    },

    tasks: [],

};


// ==========================================================
// USER
// ==========================================================

function updateUserState(data) {

    if (!data) {
        return;
    }

    if (typeof data.xp === "number") {
        AppState.user.xp = data.xp;
    }

    if (typeof data.level === "number") {
        AppState.user.level = data.level;
    }

    if (typeof data.streak === "number") {
        AppState.user.streak = data.streak;
    }

    if (window.ToDoSoloStorage) {

        window.ToDoSoloStorage.saveUser(
            AppState.user
        );

    }
}


// ==========================================================
// TASKS
// ==========================================================

function setTasksState(tasks) {

    if (!Array.isArray(tasks)) {
        AppState.tasks = [];
        return;
    }

    AppState.tasks = tasks;
}


// ==========================================================
// GETTERS
// ==========================================================

function getUserState() {

    return {
        ...AppState.user,
    };

}


function getTasksState() {

    return [
        ...AppState.tasks,
    ];

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.ToDoSoloState = {

    state: AppState,

    updateUser: updateUserState,

    setTasks: setTasksState,

    getUser: getUserState,

    getTasks: getTasksState,

};

