import { state } from "./state.js";

import { saveState } from "./storage.js";

import { saveProfile } from "./api.js";

import { updateQuestProgress } from "./quests.js";

import {updateXPUI,triggerConfetti,playLevelUpSound,showXPPopup} from "./ui.js";

export function addXP(amount) {

    state.xp += amount;

    updateQuestProgress(
        "xp",
        amount
    );

    saveProfile(state);

    saveState();

    showXPPopup(amount);

    updateXPUI();

    checkLevelUp();

}

function checkLevelUp() {

    const nextLevelXP =
        state.level * 100;

    if (state.xp >= nextLevelXP) {

        state.level++;

        playLevelUpSound();

        triggerConfetti();

    }

}