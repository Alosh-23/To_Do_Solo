/**
 * ==========================================================
 * TO DO SOLO
 * THEME SYSTEM
 * ==========================================================
 */

const ToDoSoloTheme = {

    STORAGE_KEY:
        "todo_solo_theme",

    LIGHT:
        "light",

    DARK:
        "dark",


    /**
     * ======================================================
     * GET SAVED THEME
     * ======================================================
     */

    getSavedTheme() {

        const theme =
            localStorage.getItem(
                this.STORAGE_KEY
            );


        if (
            theme === this.LIGHT ||
            theme === this.DARK
        ) {

            return theme;

        }


        return null;

    },


    /**
     * ======================================================
     * GET SYSTEM THEME
     * ======================================================
     */

    getSystemTheme() {

        if (
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
        ) {

            return this.DARK;

        }


        return this.LIGHT;

    },


    /**
     * ======================================================
     * GET CURRENT THEME
     * ======================================================
     */

    get() {

        return (
            this.getSavedTheme() ||
            this.getSystemTheme()
        );

    },


    /**
     * ======================================================
     * APPLY THEME
     * ======================================================
     */

    apply(theme) {

        const selectedTheme =
            theme === this.DARK
                ? this.DARK
                : this.LIGHT;


        document.documentElement
            .setAttribute(
                "data-theme",
                selectedTheme
            );


        document.documentElement
            .setAttribute(
                "data-color-scheme",
                selectedTheme
            );


        this.updateThemeButtons(
            selectedTheme
        );


        return selectedTheme;

    },


    /**
     * ======================================================
     * SAVE THEME
     * ======================================================
     */

    save(theme) {

        const selectedTheme =
            this.apply(theme);


        localStorage.setItem(
            this.STORAGE_KEY,
            selectedTheme
        );


        return selectedTheme;

    },


    /**
     * ======================================================
     * TOGGLE THEME
     * ======================================================
     */

    toggle() {

        const currentTheme =
            this.get();


        const nextTheme =
            currentTheme === this.DARK
                ? this.LIGHT
                : this.DARK;


        return this.save(
            nextTheme
        );

    },


    /**
     * ======================================================
     * UPDATE BUTTONS
     * ======================================================
     */

    updateThemeButtons(theme) {

        document
            .querySelectorAll(
                "[data-theme-toggle]"
            )
            .forEach(
                button => {

                    const isDark =
                        theme === this.DARK;


                    button.setAttribute(
                        "aria-pressed",
                        String(isDark)
                    );


                    button.dataset.theme =
                        theme;

                }
            );

    },


    /**
     * ======================================================
     * INITIALIZE
     * ======================================================
     */

    initialize() {

        const theme =
            this.get();


        this.apply(
            theme
        );


        // Update when the system theme changes,
        // but only when the user has not selected
        // a manual theme.
        if (
            window.matchMedia
        ) {

            const mediaQuery =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                );


            const handleSystemThemeChange =
                (event) => {

                    if (
                        this.getSavedTheme()
                    ) {

                        return;

                    }


                    this.apply(
                        event.matches
                            ? this.DARK
                            : this.LIGHT
                    );

                };


            if (
                typeof mediaQuery.addEventListener ===
                "function"
            ) {

                mediaQuery.addEventListener(
                    "change",
                    handleSystemThemeChange
                );

            }
            else if (
                typeof mediaQuery.addListener ===
                "function"
            ) {

                mediaQuery.addListener(
                    handleSystemThemeChange
                );

            }

        }

    },

};


/**
 * ==========================================================
 * INITIALIZE
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloTheme.initialize();

    }
);


/**
 * ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.ToDoSoloTheme =
    ToDoSoloTheme;

