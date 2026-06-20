import { state } from "./state.js";

import { addXP } from "./xp.js";

import { saveState } from "./storage.js";

export function updateMissionProgress() {

    state.missions.forEach(mission => {

        if (mission.completed) return;

        mission.progress++;

        if (
            mission.progress >= mission.goal
        ) {

            mission.completed = true;

            addXP(mission.reward);
            
            saveState();

            alert(
                `Mission Complete: ${mission.title}`
            );
            
            renderMissions();

        }

    });

}

export function renderMissions() {

    const missionsList =
        document.getElementById(
            "missions-list"
        );

    missionsList.innerHTML = "";

    (state.missions || []).forEach(mission => {

        missionsList.innerHTML += `

            <div class="mission">

                <div>
                    🎯 ${mission.title}
                </div>

                <div>
                    ${mission.progress} / ${mission.goal}
                </div>

            </div>

        `;

    });

}