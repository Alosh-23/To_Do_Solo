/**
 * ==========================================================
 * TO DO SOLO
 * DROPDOWN COMPONENT
 * ==========================================================
 */

const ToDoSoloDropdown = {

    closeAll(except = null) {

        document
            .querySelectorAll(
                "[data-dropdown].is-open"
            )
            .forEach(
                dropdown => {

                    if (
                        dropdown !== except
                    ) {

                        dropdown.classList.remove(
                            "is-open"
                        );

                    }

                }
            );

    },


    open(dropdown) {

        if (!dropdown) {
            return;
        }

        this.closeAll(
            dropdown
        );

        dropdown.classList.add(
            "is-open"
        );

    },


    close(dropdown) {

        if (!dropdown) {
            return;
        }

        dropdown.classList.remove(
            "is-open"
        );

    },


    toggle(dropdown) {

        if (!dropdown) {
            return;
        }

        if (
            dropdown.classList.contains(
                "is-open"
            )
        ) {

            this.close(dropdown);

        }
        else {

            this.open(dropdown);

        }

    },


    initialize() {

        document.addEventListener(
            "click",
            (event) => {

                const toggle =
                    event.target.closest(
                        "[data-dropdown-toggle]"
                    );


                if (toggle) {

                    const dropdown =
                        toggle.closest(
                            "[data-dropdown]"
                        );

                    this.toggle(
                        dropdown
                    );

                    return;

                }


                if (
                    !event.target.closest(
                        "[data-dropdown]"
                    )
                ) {

                    this.closeAll();

                }

            }
        );

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloDropdown.initialize();

    }
);


window.ToDoSoloDropdown =
    ToDoSoloDropdown;