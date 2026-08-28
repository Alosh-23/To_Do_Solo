/**
 * ==========================================================
 * TO DO SOLO
 * MODAL COMPONENT
 * ==========================================================
 */

const ToDoSoloModal = {

    activeModal: null,


    open(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "is-open"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        this.activeModal =
            modal;

    },


    close(modal = null) {

        const target =
            modal ||
            this.activeModal;

        if (!target) {
            return;
        }

        target.classList.remove(
            "is-open"
        );

        target.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        this.activeModal = null;

    },


    toggle(modal) {

        if (!modal) {
            return;
        }

        if (
            modal.classList.contains(
                "is-open"
            )
        ) {

            this.close(modal);

        }
        else {

            this.open(modal);

        }

    },


    initialize() {

        document.addEventListener(
            "click",
            (event) => {

                const openButton =
                    event.target.closest(
                        "[data-modal-open]"
                    );


                if (openButton) {

                    const selector =
                        openButton.dataset.modalOpen;


                    const modal =
                        document.querySelector(
                            selector
                        );


                    this.open(
                        modal
                    );

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-modal-close]"
                    );


                if (closeButton) {

                    const modal =
                        closeButton.closest(
                            ".modal"
                        );


                    this.close(
                        modal
                    );

                }

            }
        );


        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    this.activeModal
                ) {

                    this.close();

                }

            }
        );

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloModal.initialize();

    }
);


window.ToDoSoloModal =
    ToDoSoloModal;