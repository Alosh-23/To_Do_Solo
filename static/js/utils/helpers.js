/**
 * ==========================================================
 * TO DO SOLO
 * HELPERS
 * ==========================================================
 */

const ToDoSoloHelpers = {

    isObject(value) {

        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );

    },


    isEmpty(value) {

        return (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        );

    },


    query(selector, parent = document) {

        return parent.querySelector(
            selector
        );

    },


    queryAll(selector, parent = document) {

        return Array.from(
            parent.querySelectorAll(
                selector
            )
        );

    },


    sleep(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );

    },


    getLanguage() {

        return (
            document.documentElement.lang ||
            "en"
        );

    },


    toggleClass(
        element,
        className,
        condition
    ) {

        if (!element) {
            return;
        }


        element.classList.toggle(
            className,
            Boolean(condition)
        );

    },

};


window.ToDoSoloHelpers =
    ToDoSoloHelpers;