/**
 * ==========================================================
 * TO DO SOLO
 * SIDEBAR COMPONENT
 * ==========================================================
 */

const ToDoSoloSidebar = {

    sidebar: null,

    overlay: null,


    initialize() {

        this.sidebar =
            document.querySelector(
                "[data-sidebar]"
            );


        this.overlay =
            document.querySelector(
                "[data-sidebar-overlay]"
            );


        if (!this.sidebar) {
            return;
        }


        const toggle =
            document.querySelector(
                "[data-sidebar-toggle]"
            );


        const closeButton =
            document.querySelector(
                "[data-sidebar-close]"
            );


        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    this.toggle();

                }
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    this.close();

                }
            );

        }


        if (this.overlay) {

            this.overlay.addEventListener(
                "click",
                () => {

                    this.close();

                }
            );

        }


        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {

                    this.close();

                }

            }
        );

    },


    open() {

        if (!this.sidebar) {
            return;
        }


        this.sidebar.classList.add(
            "is-open"
        );


        if (this.overlay) {

            this.overlay.classList.add(
                "is-visible"
            );

        }


        document.body.classList.add(
            "sidebar-open"
        );

    },


    close() {

        if (!this.sidebar) {
            return;
        }


        this.sidebar.classList.remove(
            "is-open"
        );


        if (this.overlay) {

            this.overlay.classList.remove(
                "is-visible"
            );

        }


        document.body.classList.remove(
            "sidebar-open"
        );

    },


    toggle() {

        if (
            this.sidebar?.classList.contains(
                "is-open"
            )
        ) {

            this.close();

        }
        else {

            this.open();

        }

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloSidebar.initialize();

    }
);


window.ToDoSoloSidebar =
    ToDoSoloSidebar;