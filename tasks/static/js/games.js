import { state } from './state.js';
import { addXP } from './xp.js';
import { saveState } from './storage.js';
import { updateQuestProgress } from './quests.js';

function awardBonus(amount, reason) {
    state.xp += amount;
    state.completedTasks += 1;
    updateQuestProgress('xp', amount);
    saveState();
    if (window.__toDoAppRefresh) {
        window.__toDoAppRefresh();
    }
    alert(`${reason} +${amount} XP`);
}

export function attachGameButtons() {
    const sparkBtn = document.getElementById('spark-btn');
    const sprintBtn = document.getElementById('sprint-btn');
    const questBtn = document.getElementById('quest-btn');

    if (sparkBtn) {
        sparkBtn.addEventListener('click', () => {
            awardBonus(12, 'Spark bonus');
        });
    }

    if (sprintBtn) {
        sprintBtn.addEventListener('click', () => {
            awardBonus(18, 'Focus sprint');
        });
    }

    if (questBtn) {
        questBtn.addEventListener('click', () => {
            awardBonus(10, 'Daily quest bonus');
        });
    }
}
