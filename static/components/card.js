/**
 * ==========================================================
 * TO DO SOLO
 * CARD COMPONENT
 * ==========================================================
 */

const ToDoSoloCard = {

    /**
     * Add a CSS class to a card.
     */
    addState(card, state) {

        if (!card || !state) {
            return;
        }

        card.classList.add(state);

    },


    /**
     * Remove a CSS class from a card.
     */
    removeState(card, state) {

        if (!card || !state) {
            return;
        }

        card.classList.remove(state);

    },


    /**
     * Toggle a CSS class.
     */
    toggleState(
        card,
        state,
        force = undefined
    ) {

        if (!card || !state) {
            return;
        }

        card.classList.toggle(
            state,
            force
        );

    },


    /**
     * Find a card by a data ID.
     */
    findById(
        container,
        id,
        attribute = "data-id"
    ) {

        if (!container || id === undefined) {
            return null;
        }

        return container.querySelector(
            `[${attribute}="${id}"]`
        );

    },


    /**
     * Remove a card safely.
     */
    remove(card) {

        if (!card) {
            return false;
        }

        card.remove();

        return true;

    },

};


window.ToDoSoloCard =
    ToDoSoloCard;