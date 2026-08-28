/**
 * ==========================================================
 * TO DO SOLO
 * MISSIONS
 * ==========================================================
 */

const Missions = {

    items: [],


    set(items) {

        this.items =
            Array.isArray(items)
                ? items
                : [];

    },


    getAll() {

        return [
            ...this.items
        ];

    },


    getActive() {

        return this.items.filter(
            mission =>
                !mission.completed
        );

    },


    getCompleted() {

        return this.items.filter(
            mission =>
                Boolean(
                    mission.completed
                )
        );

    },


    getById(id) {

        return this.items.find(
            mission =>
                String(mission.id) ===
                String(id)
        ) || null;

    },

};


window.ToDoSoloMissions =
    Missions;