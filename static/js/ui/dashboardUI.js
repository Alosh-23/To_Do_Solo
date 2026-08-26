/**
 * ==========================================================
 * TO DO SOLO
 * DASHBOARD UI
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});


/**
 * ==========================================================
 * INITIALIZE DASHBOARD
 * ==========================================================
 */

async function initializeDashboard() {

    if (!window.ToDoSoloState) {
        return;
    }


    // ------------------------------------------------------
    // Try to load fresh data from Django API.
    // ------------------------------------------------------

    if (
        window.StatsAPI &&
        typeof window.StatsAPI.getStats === "function"
    ) {

        try {

            const response =
                await window.StatsAPI.getStats();


            if (
                response &&
                response.success &&
                response.stats
            ) {

                const stats =
                    response.stats;


                const userData = {

                    xp:
                        Number(stats.xp) || 0,

                    level:
                        Number(stats.level) || 1,

                    streak:
                        Number(stats.streak) || 0,

                };


                window.ToDoSoloState.updateUser(
                    userData
                );


                updateDashboard(
                    userData
                );


                return;

            }

        }
        catch (error) {

            console.error(
                "Failed to load dashboard data:",
                error
            );

        }

    }


    // ------------------------------------------------------
    // Fallback to values rendered by Django.
    // ------------------------------------------------------

    initializeDashboardFromHTML();

}


/**
 * ==========================================================
 * FALLBACK: READ DJANGO HTML
 * ==========================================================
 */

function initializeDashboardFromHTML() {

    const xpElement =
        document.querySelector(
            ".dashboard-xp-value"
        );

    const levelElement =
        document.querySelector(
            ".dashboard-level-value"
        );

    const streakElement =
        document.querySelector(
            ".dashboard-streak-value"
        );


    const djangoUser = {

        xp:
            xpElement
                ? Number(
                    xpElement.textContent.trim()
                )
                : 0,

        level:
            levelElement
                ? Number(
                    levelElement.textContent.trim()
                )
                : 1,

        streak:
            streakElement
                ? Number(
                    streakElement.textContent.trim()
                )
                : 0,

    };


    window.ToDoSoloState.updateUser(
        djangoUser
    );


    updateDashboard(
        djangoUser
    );

}


/**
 * ==========================================================
 * UPDATE DASHBOARD
 * ==========================================================
 */

function updateDashboard(user) {

    if (!user) {
        return;
    }


    updateXP(user.xp);

    updateLevel(user.level);

    updateStreak(user.streak);

}


/**
 * ==========================================================
 * XP
 * ==========================================================
 */

function updateXP(xp) {

    const xpValue =
        Number(xp) || 0;


    const xpElements =
        document.querySelectorAll(
            ".dashboard-xp-value"
        );


    xpElements.forEach((element) => {

        element.textContent =
            xpValue;

    });


    const xpProgress =
        document.querySelector(
            ".dashboard-xp-progress"
        );


    if (xpProgress) {

        const progress =
            xpValue % 100;


        xpProgress.style.width =
            `${progress}%`;

    }

}


/**
 * ==========================================================
 * LEVEL
 * ==========================================================
 */

function updateLevel(level) {

    const levelValue =
        Number(level) || 1;


    const levelElements =
        document.querySelectorAll(
            ".dashboard-level-value"
        );


    levelElements.forEach((element) => {

        element.textContent =
            levelValue;

    });

}


/**
 * ==========================================================
 * STREAK
 * ==========================================================
 */

function updateStreak(streak) {

    const streakValue =
        Number(streak) || 0;


    const streakElements =
        document.querySelectorAll(
            ".dashboard-streak-value"
        );


    streakElements.forEach((element) => {

        element.textContent =
            streakValue;

    });

}


/**
 * ==========================================================
 * PUBLIC API
 * ==========================================================
 */

window.ToDoSoloDashboard = {

    refresh() {

        if (!window.ToDoSoloState) {
            return;
        }


        const user =
            window.ToDoSoloState.getUser();


        updateDashboard(
            user
        );

    },


    async refreshFromServer() {

        if (
            !window.StatsAPI ||
            typeof window.StatsAPI.getStats !== "function"
        ) {

            return;

        }


        try {

            const response =
                await window.StatsAPI.getStats();


            if (
                !response ||
                !response.success ||
                !response.stats
            ) {

                return;

            }


            const stats =
                response.stats;


            const userData = {

                xp:
                    Number(stats.xp) || 0,

                level:
                    Number(stats.level) || 1,

                streak:
                    Number(stats.streak) || 0,

            };


            if (window.ToDoSoloState) {

                window.ToDoSoloState.updateUser(
                    userData
                );

            }


            updateDashboard(
                userData
            );


        }
        catch (error) {

            console.error(
                "Failed to refresh dashboard:",
                error
            );

        }

    },

};
