/**
 * ==========================================================
 * TO DO SOLO
 * DEBOUNCE
 * ==========================================================
 */

function debounce(
    callback,
    delay = 300
) {

    let timeoutId = null;


    return function (...args) {

        clearTimeout(
            timeoutId
        );


        timeoutId = setTimeout(() => {

            callback.apply(
                this,
                args
            );

        }, delay);

    };

}


window.ToDoSoloDebounce =
    debounce;