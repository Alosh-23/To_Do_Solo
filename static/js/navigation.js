/**
 * ==========================================================
 * TO DO SOLO
 * NAVIGATION
 * ==========================================================
 */

const ToDoSoloNavigation = {

    go(url) {

        if (!url) {
            return;
        }


        window.location.href = url;

    },


    reload() {

        window.location.reload();

    },


    back() {

        window.history.back();

    },


    currentPath() {

        return window.location.pathname;

    },


    isPath(path) {

        return (
            this.currentPath() === path
        );

    },

};


window.ToDoSoloNavigation =
    ToDoSoloNavigation;