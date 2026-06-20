import { state } from "./state.js";
import { updateStreakUI } from "./ui.js";
import { saveState } from "./storage.js";
import { saveProfile } from "./api.js";

export function updateStreak() {

    const today =
        new Date().toDateString();

    if (
        state.lastCompletedDate === null
    ) {

        state.streak = 1;

    }

    else {

        const lastDate =
            new Date(state.lastCompletedDate);

        const currentDate =
            new Date(today);

        const diffTime =
            currentDate - lastDate;

        const diffDays =
            diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {

            state.streak++;

        }

        else if (diffDays > 1) {

            state.streak = 1;

        }

    }

    state.lastCompletedDate = today;

    saveState();

    saveProfile(state);

    updateStreakUI();

}