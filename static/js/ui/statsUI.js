/**
 * ==========================================================
 * TO DO SOLO
 * STATS UI
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    loadStats();

});


/**
 * ==========================================================
 * LOAD STATS
 * ==========================================================
 */

async function loadStats() {

    if (!window.StatsAPI) {
        return;
    }


    try {

        const response =
            await window.StatsAPI.getStats();


        if (!response.success) {

            throw new Error(
                "Failed to load statistics."
            );

        }


        const stats =
            response.stats;


        // Update global user state.
        if (window.ToDoSoloState) {

            window.ToDoSoloState.updateUser({

                xp: stats.xp,

                level: stats.level,

                streak: stats.streak,

            });

        }


        // Update statistics cards.
        updateStat(
            ".stats-total-tasks",
            stats.total_tasks
        );

        updateStat(
            ".stats-completed-tasks",
            stats.completed_tasks
        );

        updateStat(
            ".stats-pending-tasks",
            stats.pending_tasks
        );

        updateStat(
            ".stats-completion-rate",
            `${stats.completion_rate}%`
        );

        updateStat(
            ".stats-xp",
            stats.xp
        );

        updateStat(
            ".stats-level",
            stats.level
        );

        updateStat(
            ".stats-streak",
            stats.streak
        );

    }
    catch (error) {

        console.error(
            "Failed to load statistics:",
            error
        );

    }

}


/**
 * ==========================================================
 * UPDATE ELEMENT
 * ==========================================================
 */

function updateStat(
    selector,
    value
) {

    const elements =
        document.querySelectorAll(
            selector
        );


    elements.forEach((element) => {

        element.textContent = value;

    });

}


/**
 * ==========================================================
 * PUBLIC API
 * ==========================================================
 */

window.ToDoSoloStats = {

    refresh: loadStats,

};

