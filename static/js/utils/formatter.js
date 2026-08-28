/**
 * ==========================================================
 * TO DO SOLO
 * FORMATTER
 * ==========================================================
 */

const ToDoSoloFormatter = {

    number(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "0";

        }


        return number.toLocaleString();

    },


    percentage(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "0%";

        }


        return `${number}%`;

    },


    xp(value) {

        return `${this.number(value)} XP`;

    },


    days(value) {

        const number =
            Number(value);


        if (number === 1) {

            return "1 Day";

        }


        return `${this.number(number)} Days`;

    },

};


window.ToDoSoloFormatter =
    ToDoSoloFormatter;