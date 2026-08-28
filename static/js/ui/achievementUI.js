/**
 * ==========================================================
 * TO DO SOLO
 * ACHIEVEMENT UI
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAchievementUI();

    }
);


/**
 * ==========================================================
 * INITIALIZE
 * ==========================================================
 */

async function initializeAchievementUI() {

    if (
        !window.AchievementAPI ||
        !window.ToDoSoloAchievements
    ) {

        return;

    }


    const container =
        document.querySelector(
            "[data-achievements-list]"
        );


    if (!container) {

        return;

    }


    try {

        const response =
            await window.AchievementAPI
                .getAchievements();


        if (
            !response ||
            !response.success
        ) {

            throw new Error(
                "Invalid achievement response."
            );

        }


        window.ToDoSoloAchievements
            .setFromAPI(
                response.achievements
            );


        renderAchievementList();


        updateAchievementProgress();

    }
    catch (error) {

        console.error(
            "Failed to initialize achievements:",
            error
        );

    }

}


/**
 * ==========================================================
 * RENDER
 * ==========================================================
 */

function renderAchievementList() {

    const container =
        document.querySelector(
            "[data-achievements-list]"
        );


    if (!container) {
        return;
    }


    const achievements =
        window.ToDoSoloAchievements
            .getAll();


    const language =
        document.documentElement.lang ||
        "en";


    container.innerHTML = "";


    achievements.forEach(
        achievement => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                achievement.unlocked
                    ? "achievement-card is-unlocked"
                    : "achievement-card is-locked";


            card.dataset.achievementKey =
                achievement.key;


            const title =
                window.ToDoSoloAchievements
                    .getTitle(
                        achievement,
                        language
                    );


            const status =
                achievement.unlocked
                    ? (
                        language === "ar"
                            ? "مكتمل"
                            : "Unlocked"
                    )
                    : (
                        language === "ar"
                            ? "مقفل"
                            : "Locked"
                    );


            card.innerHTML = `

                <div
                    class="achievement-card-title"
                >
                    ${escapeAchievementHTML(
                        title
                    )}
                </div>

                <div
                    class="achievement-card-status"
                >
                    ${escapeAchievementHTML(
                        status
                    )}
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/**
 * ==========================================================
 * PROGRESS
 * ==========================================================
 */

function updateAchievementProgress() {

    const progress =
        window.ToDoSoloAchievements
            .getProgress();


    document
        .querySelectorAll(
            "[data-achievements-progress]"
        )
        .forEach(
            element => {

                element.textContent =
                    `${progress}%`;

            }
        );

}


/**
 * ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapeAchievementHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value ?? "";


    return element.innerHTML;

}


/**
 * ==========================================================
 * PUBLIC API
 * ==========================================================
 */

window.ToDoSoloAchievementUI = {

    initialize:
        initializeAchievementUI,

    render:
        renderAchievementList,

    refresh:
        initializeAchievementUI,

};

