/**
 * ==========================================================
 * TO DO SOLO
 * STREAK SYSTEM
 * ==========================================================
 */

const ToDoSoloStreak = {

    current: 0,


    /**
     * ======================================================
     * NORMALIZE
     * ======================================================
     */

    normalize(value) {

        const streak =
            Number(value);


        if (!Number.isFinite(streak)) {

            return 0;

        }


        return Math.max(
            0,
            Math.floor(streak)
        );

    },


    /**
     * ======================================================
     * SET
     * ======================================================
     */

    set(value) {

        this.current =
            this.normalize(value);


        return this.current;

    },


    /**
     * ======================================================
     * GET
     * ======================================================
 */

    get() {

        return this.current;

    },


    /**
     * ======================================================
     * IS ACTIVE
     * ======================================================
     */

    isActive() {

        return this.current > 0;

    },


    /**
     * ======================================================
     * UPDATE UI
     * ======================================================
     */

    render(value = this.current) {

        const streak =
            this.normalize(value);


        this.set(streak);


        document
            .querySelectorAll(
                ".dashboard-streak-value"
            )
            .forEach(
                element => {

                    element.textContent =
                        streak;

                }
            );


        document
            .querySelectorAll(
                "[data-streak-value]"
            )
            .forEach(
                element => {

                    element.textContent =
                        streak;

                }
            );


        return streak;

    },


    /**
     * ======================================================
     * SYNC FROM USER STATE
     * ======================================================
     */

    sync(user) {

        if (!user) {
            return;
        }


        this.render(
            user.streak
        );

    },


    /**
     * ======================================================
     * SYNC TO USER STATE
     * ======================================================
     */

    syncState() {

        if (
            !window.ToDoSoloState
        ) {

            return;

        }


        const user =
            window.ToDoSoloState.getUser();


        if (!user) {
            return;
        }


        this.render(
            user.streak
        );

    },


    /**
     * ======================================================
     * REFRESH FROM STATS API
     * ======================================================
     */

    async refreshFromServer() {

        if (
            !window.StatsAPI ||
            typeof window.StatsAPI.getStats !==
                "function"
        ) {

            return null;

        }


        try {

            const response =
                await window.StatsAPI.getStats();


            if (
                !response ||
                !response.success ||
                !response.stats
            ) {

                return null;

            }


            const streak =
                this.normalize(
                    response.stats.streak
                );


            this.render(
                streak
            );


            if (
                window.ToDoSoloState
            ) {

                window.ToDoSoloState.updateUser({

                    streak,

                    xp:
                        Number(
                            response.stats.xp
                        ) || 0,

                    level:
                        Number(
                            response.stats.level
                        ) || 1,

                });

            }


            return streak;

        }
        catch (error) {

            console.error(
                "Failed to refresh streak:",
                error
            );


            return null;

        }

    },


    /**
     * ======================================================
     * RESET LOCAL VALUE
     * ======================================================
     *
     * This only resets the frontend value.
     * It does NOT modify Django.
     */

    reset() {

        this.current = 0;

        this.render(0);

    },


    /**
     * ======================================================
     * FORMAT
     * ======================================================
     */

    format(
        value = this.current,
        language = null
    ) {

        const streak =
            this.normalize(value);


        const currentLanguage =
            language ||
            document.documentElement.lang ||
            "en";


        if (
            currentLanguage === "ar"
        ) {

            if (streak === 0) {

                return "0 يوم";

            }


            if (streak === 1) {

                return "يوم واحد";

            }


            if (streak === 2) {

                return "يومان";

            }


            if (
                streak >= 3 &&
                streak <= 10
            ) {

                return `${streak} أيام`;

            }


            return `${streak} يومًا`;

        }


        return (
            streak === 1
                ? "1 day"
                : `${streak} days`
        );

    },

};


/**
 * ==========================================================
 * INITIALIZE
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            window.ToDoSoloState
        ) {

            const user =
                window.ToDoSoloState.getUser();


            if (user) {

                ToDoSoloStreak.sync(
                    user
                );

            }

        }

    }
);


/**
 * ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.ToDoSoloStreak =
    ToDoSoloStreak;

