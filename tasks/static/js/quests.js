import { state } from "./state.js";

import { addXP } from "./xp.js";

import {renderQuests} from "./ui.js";

const questTemplates = [

    {
        type: "tasks",

        title: "Complete 3 tasks",

        goal: 3,

        reward: 40
    },

    {
        type: "xp",

        title: "Earn 50 XP",

        goal: 50,

        reward: 70
    },

];

export function generateDailyQuests() {

    state.dailyQuests = [];

    const shuffledQuests =
        [...questTemplates]
        .sort(() => Math.random() - 0.5);

    for (let i = 0; i < 2; i++) {

        const randomQuest =
            shuffledQuests[i];

        state.dailyQuests.push({

            ...randomQuest,

            progress: 0,

            completed: false,

        });

    }

}

export function updateQuestProgress(
    type,
    amount = 1
) {

    state.dailyQuests.forEach(quest => {

        if (quest.completed) return;

        if (quest.type !== type) return;

        quest.progress += amount;

        if (
            quest.progress >= quest.goal
        ) {

            quest.progress =
                quest.goal;

            quest.completed = true;

            addXP(quest.reward);

            alert(
                `Quest Complete:
                ${quest.title}`
            );

        }

    });

    renderQuests();

}

export function checkDailyReset() {

    const today =
        new Date().toDateString();

    if (
        state.lastQuestDate !== today
    ) {

        generateDailyQuests();

        state.lastQuestDate = today;

    }

}