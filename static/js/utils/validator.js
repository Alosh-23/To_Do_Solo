/**
 * ==========================================================
 * TO DO SOLO
 * VALIDATOR
 * ==========================================================
 */

const ToDoSoloValidator = {

    required(value) {

        return (
            value !== null &&
            value !== undefined &&
            String(value).trim().length > 0
        );

    },


    minLength(value, length) {

        if (!this.required(value)) {
            return false;
        }


        return (
            String(value).trim().length >=
            length
        );

    },


    maxLength(value, length) {

        if (!value) {
            return true;
        }


        return (
            String(value).trim().length <=
            length
        );

    },


    email(value) {

        if (!this.required(value)) {
            return false;
        }


        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
                String(value).trim()
            );

    },


    positiveNumber(value) {

        const number =
            Number(value);


        return (
            Number.isFinite(number) &&
            number >= 0
        );

    },

};


window.ToDoSoloValidator =
    ToDoSoloValidator;