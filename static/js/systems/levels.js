/**
 * ==========================================================
 * TO DO SOLO
 * LEVEL SYSTEM
 * ==========================================================
 */

const Levels = {

    XP_PER_LEVEL: 100,


    getLevelFromXP(xp) {

        const value =
            Math.max(
                0,
                Number(xp) || 0
            );


        return (
            Math.floor(
                value /
                this.XP_PER_LEVEL
            ) + 1
        );

    },


    getXPIntoLevel(xp) {

        const value =
            Math.max(
                0,
                Number(xp) || 0
            );


        return (
            value %
            this.XP_PER_LEVEL
        );

    },


    getXPForNextLevel(xp) {

        const currentXP =
            Math.max(
                0,
                Number(xp) || 0
            );


        return (
            this.XP_PER_LEVEL -
            (
                currentXP %
                this.XP_PER_LEVEL
            )
        );

    },


    getProgress(xp) {

        return this.getXPIntoLevel(
            xp
        );

    },

};


window.ToDoSoloLevels =
    Levels;