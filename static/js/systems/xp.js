/**
 * ==========================================================
 * TO DO SOLO
 * XP SYSTEM
 * ==========================================================
 */

const ToDoSoloXP = {

    XP_PER_TASK: 10,

    XP_PER_LEVEL: 100,


    /**
     * ======================================================
     * NORMALIZE XP
     * ======================================================
     */

    normalize(value) {

        const xp =
            Number(value);


        if (!Number.isFinite(xp)) {
            return 0;
        }


        return Math.max(
            0,
            Math.floor(xp)
        );

    },


    /**
     * ======================================================
     * GET CURRENT LEVEL
     * ======================================================
     */

    getLevel(xp) {

        const value =
            this.normalize(xp);


        return (
            Math.floor(
                value /
                this.XP_PER_LEVEL
            ) + 1
        );

    },


    /**
     * ======================================================
     * XP INSIDE CURRENT LEVEL
     * ======================================================
     */

    getCurrentLevelXP(xp) {

        const value =
            this.normalize(xp);


        return (
            value %
            this.XP_PER_LEVEL
        );

    },


    /**
     * ======================================================
     * XP NEEDED FOR NEXT LEVEL
     * ======================================================
     */

    getXPToNextLevel(xp) {

        const value =
            this.normalize(xp);


        const current =
            this.getCurrentLevelXP(
                value
            );


        return (
            this.XP_PER_LEVEL -
            current
        );

    },


    /**
     * ======================================================
     * LEVEL PROGRESS
     * ======================================================
     */

    getProgress(xp) {

        const value =
            this.normalize(xp);


        return (
            this.getCurrentLevelXP(
                value
            )
        );

    },


    /**
     * ======================================================
     * IS LEVEL UP
     * ======================================================
     */

    isLevelUp(
        previousXP,
        currentXP
    ) {

        return (
            this.getLevel(
                currentXP
            ) >
            this.getLevel(
                previousXP
            )
        );

    },


    /**
     * ======================================================
     * CALCULATE XP AFTER TASK
     * ======================================================
     *
     * This is only a UI helper.
     * The server remains the source of truth.
     */

    calculateAfterTask(
        currentXP,
        completed = true
    ) {

        const xp =
            this.normalize(
                currentXP
            );


        const change =
            completed
                ? this.XP_PER_TASK
                : -this.XP_PER_TASK;


        return Math.max(
            0,
            xp + change
        );

    },


    /**
     * ======================================================
     * FORMAT
     * ======================================================
     */

    format(xp) {

        return `${this.normalize(xp)} XP`;

    },


    /**
     * ======================================================
     * SYNC STATE
     * ======================================================
     */

    sync(
        user
    ) {

        if (
            !user ||
            !window.ToDoSoloState
        ) {

            return;

        }


        const xp =
            this.normalize(
                user.xp
            );


        const level =
            Number(user.level) ||
            this.getLevel(xp);


        window.ToDoSoloState.updateUser({

            xp,

            level,

        });

    },


};


/**
 * ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.ToDoSoloXP =
    ToDoSoloXP;

