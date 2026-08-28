/**
 * ==========================================================
 * TO DO SOLO
 * DIALOG COMPONENT
 * ==========================================================
 */

const ToDoSoloDialog = {

    activeDialog: null,


    /**
     * Open a native dialog element.
     */
    open(dialog) {

        if (!dialog) {
            return;
        }

        if (
            typeof dialog.showModal ===
            "function"
        ) {

            dialog.showModal();

        }
        else {

            dialog.removeAttribute(
                "hidden"
            );

        }

        this.activeDialog =
            dialog;

    },


    /**
     * Close the active dialog.
     */
    close(dialog = null) {

        const target =
            dialog ||
            this.activeDialog;

        if (!target) {
            return;
        }

        if (
            typeof target.close ===
            "function"
        ) {

            target.close();

        }
        else {

            target.setAttribute(
                "hidden",
                ""
            );

        }

        this.activeDialog = null;

    },


    /**
     * Close when clicking an element
     * with data-dialog-close.
     */
    initialize() {

        document.addEventListener(
            "click",
            (event) => {

                const closeButton =
                    event.target.closest(
                        "[data-dialog-close]"
                    );

                if (!closeButton) {
                    return;
                }

                this.close();

            }
        );

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloDialog.initialize();

    }
);


window.ToDoSoloDialog =
    ToDoSoloDialog;