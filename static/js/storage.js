/**
 * ==========================================================
 * TO DO SOLO
 * STORAGE
 * ==========================================================
 */

const STORAGE_KEY = "todo_solo_user_state";


// ==========================================================
// SAVE USER STATE
// ==========================================================

function saveUserState(user) {

    if (!user) {
        return;
    }

    const data = {

        xp:
            Number.isFinite(user.xp)
                ? user.xp
                : 0,

        level:
            Number.isFinite(user.level)
                ? user.level
                : 1,

        streak:
            Number.isFinite(user.streak)
                ? user.streak
                : 0,

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// ==========================================================
// LOAD USER STATE
// ==========================================================

function loadUserState() {

    const stored =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!stored) {
        return null;
    }


    try {

        const data =
            JSON.parse(stored);


        return {

            xp:
                Number.isFinite(data.xp)
                    ? data.xp
                    : 0,

            level:
                Number.isFinite(data.level)
                    ? data.level
                    : 1,

            streak:
                Number.isFinite(data.streak)
                    ? data.streak
                    : 0,

        };

    }
    catch (error) {

        console.error(
            "Failed to read saved user state:",
            error
        );

        return null;

    }

}


// ==========================================================
// CLEAR
// ==========================================================

function clearUserState() {

    localStorage.removeItem(
        STORAGE_KEY
    );

}


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.ToDoSoloStorage = {

    saveUser: saveUserState,

    loadUser: loadUserState,

    clearUser: clearUserState,

};

