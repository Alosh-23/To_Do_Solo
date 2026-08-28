/**
 * ==========================================================
 * TO DO SOLO
 * SOUNDS
 * ==========================================================
 */

const Sounds = {

    context: null,


    getContext() {

        if (!this.context) {

            this.context =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        return this.context;

    },


    beep(
        frequency = 600,
        duration = 100
    ) {

        const context =
            this.getContext();


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.frequency.value =
            frequency;


        oscillator.type =
            "sine";


        gain.gain.setValueAtTime(
            0.001,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.12,
            context.currentTime + 0.01
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime +
            duration / 1000
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            context.destination
        );


        oscillator.start();


        oscillator.stop(
            context.currentTime +
            duration / 1000
        );

    },


    success() {

        this.beep(
            700,
            100
        );

    },


    error() {

        this.beep(
            220,
            150
        );

    },

};


window.ToDoSoloSounds =
    Sounds;