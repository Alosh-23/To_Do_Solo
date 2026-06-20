import { state } from "./state.js";
import { showAchievementPopup } from "./ui.js";
import { saveState } from "./storage.js";
import { saveProfile } from "./api.js";

export function checkAchievements() {

    if (
        state.completedTasks >= 1 &&
        !state.achievements.includes("first-task")
    ) {

        unlockAchievement(
            "first-task",
            "🏆 First Task"
        );

    }

}

function unlockAchievement(id, title) {

    state.achievements.push(id);
    
    saveState();

    saveProfile(state);

    showAchievementPopup(title);

}