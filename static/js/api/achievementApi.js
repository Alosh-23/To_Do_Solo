/**
 * ==========================================================
 * TO DO SOLO
 * ACHIEVEMENT API
 * ==========================================================
 */

const AchievementAPI = {

    /**
     * ======================================================
     * GET ACHIEVEMENTS
     * ======================================================
     */

    async getAchievements() {

        const response =
            await fetch(
                "/api/achievements/",
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",
                    },

                    credentials:
                        "same-origin",
                }
            );


        const data =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                data?.detail ||
                `Failed to load achievements (${response.status})`
            );

        }


        if (
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.message ||
                "Failed to load achievements."
            );

        }


        return data;

    },


    /**
     * ======================================================
     * GET SINGLE ACHIEVEMENT
     * ======================================================
     */

    async getAchievement(
        achievementId
    ) {

        const response =
            await fetch(
                `/api/achievements/${achievementId}/`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",
                    },

                    credentials:
                        "same-origin",
                }
            );


        const data =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                data?.detail ||
                `Failed to load achievement (${response.status})`
            );

        }


        return data;

    },

};


window.AchievementAPI =
    AchievementAPI;

