/**
 * ==========================================================
 * TO DO SOLO
 * QUEST UI
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeQuestUI();

    }
);


/**
 * ==========================================================
 * INITIALIZE
 * ==========================================================
 */

function initializeQuestUI() {

    const questCards =
        document.querySelectorAll(
            ".quest-card[data-quest-key]"
        );


    questCards.forEach(
        (card) => {

            initializeQuestCard(
                card
            );

        }
    );

}


/**
 * ==========================================================
 * QUEST CARD
 * ==========================================================
 */

function initializeQuestCard(
    card
) {

    const questKey =
        card.dataset.questKey;


    if (!questKey) {
        return;
    }


    const claimButton =
        card.querySelector(
            "[data-quest-claim]"
        );


    if (!claimButton) {
        return;
    }


    const completed =
        card.dataset.completed
            ?.trim()
            .toLowerCase() === "true";

    const claimed =
        card.dataset.claimed
            ?.trim()
            .toLowerCase() === "true";


    if (claimed) {

        setClaimedState(
            claimButton
        );

        return;

    }


    if (!completed) {

        claimButton.disabled =
            true;

        return;

    }


    claimButton.disabled =
        false;


    claimButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            event.stopPropagation();


            await claimQuestReward(
                card,
                questKey,
                claimButton
            );

        }
    );

}


/**
 * ==========================================================
 * CLAIM REWARD
 * ==========================================================
 */

async function claimQuestReward(
    card,
    questKey,
    button
) {

    if (
        button.disabled ||
        card.dataset.claimed === "true"
    ) {

        return;

    }


    button.disabled = true;


    const originalText =
        button.textContent;


    button.textContent =
        getQuestText(
            "claiming"
        );


    try {

        const response =
            await window
                .QuestAPI
                .claimQuest(
                    questKey
                );


        if (!response?.success) {

            throw new Error(
                response?.message ||
                "Quest reward could not be claimed."
            );

        }


        /*
         * Mark this quest as claimed.
         */

        card.dataset.claimed =
            "true";


        /*
         * Update button.
         */

        setClaimedState(
            button
        );


        /*
         * Update profile state
         * when available.
         */

        if (
            response.xp !== undefined &&
            window.ToDoSoloState
        ) {

            const currentUser =
                window
                    .ToDoSoloState
                    .getUser?.() || {};


            window
                .ToDoSoloState
                .updateUser({

                    ...currentUser,

                    xp:
                        response.xp,

                    level:
                        response.level,

                });

        }


        /*
         * Refresh dashboard / stats
         * when those systems exist.
         */

        if (
            window.ToDoSoloDashboard &&
            typeof
            window.ToDoSoloDashboard.refresh ===
            "function"
        ) {

            window
                .ToDoSoloDashboard
                .refresh();

        }


        if (
            window.ToDoSoloStats &&
            typeof
            window.ToDoSoloStats.refresh ===
            "function"
        ) {

            window
                .ToDoSoloStats
                .refresh();

        }


        /*
         * Add notification to bell.
         */

        if (
            window.ToDoSoloNotifications &&
            typeof
            window
                .ToDoSoloNotifications
                .add ===
            "function"
        ) {

            window
                .ToDoSoloNotifications
                .add(

                    getQuestText(
                        "rewardTitle"
                    ),

                    getQuestText(
                        "rewardMessage"
                    ).replace(
                        "{xp}",
                        response.reward
                    ),

                    "🎁"

                );

        }


        /*
         * Toast.
         */

        showQuestToast(

            getQuestText(
                "rewardSuccess"
            ).replace(
                "{xp}",
                response.reward
            ),

            "success"

        );


    }
    catch (error) {

        console.error(
            "Failed to claim quest reward:",
            error
        );


        button.disabled =
            false;


        button.textContent =
            originalText;


        showQuestToast(

            error.message ||
            getQuestText(
                "rewardError"
            ),

            "error"

        );

    }

}


/**
 * ==========================================================
 * CLAIMED STATE
 * ==========================================================
 */

function setClaimedState(
    button
) {

    button.disabled =
        true;


    button.classList.add(
        "is-claimed"
    );


    button.textContent =
        getQuestText(
            "claimed"
        );

}


/**
 * ==========================================================
 * TRANSLATIONS
 * ==========================================================
 */

function getQuestText(
    key
) {

    const language =
        document.documentElement.lang ||
        "en";


    const translations = {

        en: {

            claiming:
                "Claiming...",

            claimed:
                "Claimed ✓",

            rewardTitle:
                "Quest Reward",

            rewardMessage:
                "You received {xp} XP.",

            rewardSuccess:
                "Quest reward claimed: +{xp} XP",

            rewardError:
                "Unable to claim quest reward.",

        },

        ar: {

            claiming:
                "جارٍ الاستلام...",

            claimed:
                "تم الاستلام ✓",

            rewardTitle:
                "مكافأة المهمة",

            rewardMessage:
                "حصلت على {xp} XP.",

            rewardSuccess:
                "تم استلام المكافأة: +{xp} XP",

            rewardError:
                "تعذر استلام مكافأة المهمة.",

        },

    };


    return (
        translations[language] ||
        translations.en
    )[key];

}


/**
 * ==========================================================
 * TOAST
 * ==========================================================
 */

function showQuestToast(
    message,
    type = "success"
) {

    const existingToast =
        document.querySelector(
            ".todo-solo-quest-toast"
        );


    if (existingToast) {

        existingToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `todo-solo-quest-toast todo-solo-quest-toast-${type}`;


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "is-visible"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "is-visible"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        2500
    );

}


/**
 * ==========================================================
 * OPTIONAL PROGRAMMATIC RENDER
 * ==========================================================
 */

function renderQuests(
    quests = []
) {

    const container =
        document.querySelector(
            "[data-quests-list]"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    quests.forEach(
        quest => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                quest.completed
                    ? "quest-card is-completed"
                    : "quest-card";


            item.dataset.questKey =
                quest.key || "";


            item.dataset.completed =
                quest.completed
                    ? "true"
                    : "false";


            item.dataset.claimed =
                quest.claimed
                    ? "true"
                    : "false";


            item.innerHTML = `

                <div class="quest-card__header">

                    <div>

                        <h2 class="quest-card__title">
                            ${escapeQuestHTML(
                                quest.title ||
                                "Quest"
                            )}
                        </h2>

                        <p class="quest-card__description">
                            ${escapeQuestHTML(
                                quest.description ||
                                ""
                            )}
                        </p>

                    </div>

                    <span class="quest-card__reward">
                        +${Number(
                            quest.reward || 0
                        )} XP
                    </span>

                </div>


                <div class="quest-card__progress">

                    <div class="quest-card__progress-track">

                        <div
                            class="quest-card__progress-bar"
                            style="width: ${
                                Number(
                                    quest.progress || 0
                                )
                            }%;"
                        ></div>

                    </div>


                    <div class="quest-card__progress-info">

                        <span>
                            ${Number(
                                quest.current || 0
                            )}
                            /
                            ${Number(
                                quest.target || 0
                            )}
                        </span>

                        <span>
                            ${
                                quest.completed
                                    ? "Completed"
                                    : "In Progress"
                            }
                        </span>

                    </div>

                </div>


                <div class="quest-card__actions">

                    <button
                        type="button"
                        class="button button-primary"
                        data-quest-claim
                    >
                        Claim Reward
                    </button>

                </div>

            `;


            container.appendChild(
                item
            );


            initializeQuestCard(
                item
            );

        }
    );

}


/**
 * ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapeQuestHTML(
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
 * GLOBAL EXPORT
 * ==========================================================
 */

window.ToDoSoloQuestUI = {

    render:
        renderQuests,

};