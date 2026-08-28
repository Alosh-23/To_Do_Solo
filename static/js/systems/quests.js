/**
 * ==========================================================
 * TO DO SOLO
 * QUESTS
 * ==========================================================
 */

const Quests = {

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
            quest =>
                !quest.completed
        );

    },


    getCompleted() {

        return this.items.filter(
            quest =>
                Boolean(
                    quest.completed
                )
        );

    },


    getById(id) {

        return this.items.find(
            quest =>
                String(quest.id) ===
                String(id)
        ) || null;

    },

};


window.ToDoSoloQuests =
    Quests;