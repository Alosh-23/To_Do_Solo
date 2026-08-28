/**
 * ==========================================================
 * TO DO SOLO
 * DATE UTILITIES
 * ==========================================================
 */

const ToDoSoloDate = {

    toDate(value) {

        if (!value) {
            return null;
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    },


    isValid(value) {

        return (
            this.toDate(value) !== null
        );

    },


    toISO(value) {

        const date =
            this.toDate(value);


        if (!date) {
            return null;
        }


        return date.toISOString();

    },


    format(
        value,
        language = "en"
    ) {

        const date =
            this.toDate(value);


        if (!date) {
            return "";

        }


        return new Intl.DateTimeFormat(
            language,
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        ).format(date);

    },


    isPast(value) {

        const date =
            this.toDate(value);


        if (!date) {
            return false;
        }


        return date.getTime() <
            Date.now();

    },

};


window.ToDoSoloDate =
    ToDoSoloDate;