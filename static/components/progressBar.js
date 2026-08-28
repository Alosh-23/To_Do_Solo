/**
 * ==========================================================
 * TO DO SOLO
 * PROGRESS BAR COMPONENT
 * ==========================================================
 */

const ToDoSoloProgressBar = {

    set(
        element,
        value,
        max = 100
    ) {

        if (!element) {
            return;
        }


        const safeMax =
            Math.max(
                1,
                Number(max) || 100
            );


        const safeValue =
            Math.min(
                safeMax,
                Math.max(
                    0,
                    Number(value) || 0
                )
            );


        const percentage =
            (
                safeValue /
                safeMax
            ) * 100;


        element.style.width =
            `${percentage}%`;


        element.setAttribute(
            "aria-valuenow",
            String(safeValue)
        );


        element.setAttribute(
            "aria-valuemax",
            String(safeMax)
        );

    },


    setPercentage(
        element,
        percentage
    ) {

        this.set(
            element,
            percentage,
            100
        );

    },


    reset(element) {

        this.setPercentage(
            element,
            0
        );

    },


    initialize() {

        document
            .querySelectorAll(
                "[data-progress-value]"
            )
            .forEach(
                element => {

                    const value =
                        Number(
                            element.dataset.progressValue
                        ) || 0;


                    const max =
                        Number(
                            element.dataset.progressMax
                        ) || 100;


                    this.set(
                        element,
                        value,
                        max
                    );

                }
            );

    },

};


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ToDoSoloProgressBar.initialize();

    }
);


window.ToDoSoloProgressBar =
    ToDoSoloProgressBar;