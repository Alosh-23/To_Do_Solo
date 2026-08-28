/**
 * ==========================================================
 * TO DO SOLO
 * QUEST API
 * ==========================================================
 */

const QuestAPI = {

    /**
     * ======================================================
     * CLAIM QUEST REWARD
     * ======================================================
     */

    async claimQuest(questKey) {

        if (!questKey) {

            throw new Error(
                "Quest key is required."
            );

        }


        const csrfToken =
            getQuestCSRFToken();


        const response =
            await fetch(
                `/quests/${encodeURIComponent(questKey)}/claim/`,
                {
                    method: "POST",

                    credentials: "same-origin",

                    headers: {
                        "Accept":
                            "application/json",

                        "X-CSRFToken":
                            csrfToken,
                    },
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        if (!response.ok) {

            throw new Error(

                data?.message ||

                data?.detail ||

                `Quest reward request failed (${response.status})`

            );

        }


        return data;

    },

};


/**
 * ==========================================================
 * CSRF TOKEN
 * ==========================================================
 */

function getQuestCSRFToken() {

    const cookie =
        document.cookie
            .split("; ")
            .find(
                row =>
                    row.startsWith(
                        "csrftoken="
                    )
            );


    return cookie

        ? decodeURIComponent(
            cookie.substring(
                "csrftoken=".length
            )
        )

        : "";

}


/**
 * ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.QuestAPI =
    QuestAPI;