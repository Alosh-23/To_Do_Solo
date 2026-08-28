/**
 * ==========================================================
 * TO DO SOLO
 * HEADER COMPONENT
 * ==========================================================
 */

const ToDoSoloHeader = {

    initialize() {

        this.initializeLanguageMenu();

        this.initializeMobileMenu();

    },


    initializeLanguageMenu() {

        const languageToggle =
            document.querySelector(
                "[data-language-toggle]"
            );


        const languageMenu =
            document.querySelector(
                "[data-language-menu]"
            );


        if (
            !languageToggle ||
            !languageMenu
        ) {

            return;

        }


        languageToggle.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                languageMenu.classList.toggle(
                    "is-open"
                );

            }
        );

    },


    initializeMobileMenu() {

        const toggle =
            document.querySelector(
                "[data-mobile-menu-toggle]"
            );


        const menu =
            document.querySelector(
                "[data-mobile-menu]"
            );


        if (!toggle || !menu) {
            return;
        }


        toggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    menu.classList.toggle(
                        "is-open"
                    );


                toggle.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloHeader.initialize();

    }
);


window.ToDoSoloHeader =
    ToDoSoloHeader;