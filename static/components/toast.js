/**
 * ==========================================================
 * TO DO SOLO
 * TOAST COMPONENT
 * ==========================================================
 */

const ToDoSoloToast = {

    currentToast: null,

    timeoutId: null,

    exitTimeoutId: null,


    show(
        message,
        type = "success",
        duration = 2500
    ) {

        this.remove();


        if (!message) {
            return;
        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `todo-solo-toast todo-solo-toast-${type}`;


        toast.textContent =
            message;


        toast.setAttribute(
            "role",
            "status"
        );


        toast.setAttribute(
            "aria-live",
            "polite"
        );


        document.body.appendChild(
            toast
        );


        this.currentToast =
            toast;


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "is-visible"
                );

            }
        );


        this.timeoutId =
            setTimeout(
                () => {

                    this.hide();

                },
                duration
            );

    },


    success(message) {

        this.show(
            message,
            "success"
        );

    },


    error(message) {

        this.show(
            message,
            "error"
        );

    },


    warning(message) {

        this.show(
            message,
            "warning"
        );

    },


    info(message) {

        this.show(
            message,
            "info"
        );

    },


    hide() {

        if (!this.currentToast) {
            return;
        }


        this.currentToast.classList.remove(
            "is-visible"
        );


        this.exitTimeoutId =
            setTimeout(
                () => {

                    this.remove();

                },
                250
            );

    },


    remove() {

        if (this.timeoutId) {

            clearTimeout(
                this.timeoutId
            );

            this.timeoutId = null;

        }


        if (this.exitTimeoutId) {

            clearTimeout(
                this.exitTimeoutId
            );

            this.exitTimeoutId = null;

        }


        if (this.currentToast) {

            this.currentToast.remove();

            this.currentToast = null;

        }

    },

};


window.ToDoSoloToast =
    ToDoSoloToast;