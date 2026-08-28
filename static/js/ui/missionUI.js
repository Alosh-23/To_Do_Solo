/**
 * ==========================================================
 * TO DO SOLO
 * MISSION UI
 * ==========================================================
 */

function renderMissions(
    missions = []
) {

    const container =
        document.querySelector(
            "[data-missions-list]"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    missions.forEach(
        mission => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                mission.completed
                    ? "mission-card is-completed"
                    : "mission-card";


            item.dataset.missionId =
                mission.id;


            item.innerHTML = `

                <div class="mission-card-title">
                    ${escapeMissionHTML(
                        mission.title ||
                        "Mission"
                    )}
                </div>

                <div class="mission-card-description">
                    ${escapeMissionHTML(
                        mission.description ||
                        ""
                    )}
                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


function escapeMissionHTML(value) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value ?? "";


    return element.innerHTML;

}


window.ToDoSoloMissionUI = {

    render:
        renderMissions,

};