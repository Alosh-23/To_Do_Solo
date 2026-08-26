/**
 * ==========================================================
 * TO DO SOLO
 * STATS API
 * ==========================================================
 */

const StatsAPI = {

    /**
     * ======================================================
     * GET CURRENT USER STATS
     * ======================================================
     */

    async getStats() {

        const response =
            await fetch(
                "/api/stats/",
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json",
                    },

                    credentials: "same-origin",
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        }
        catch (error) {

            throw new Error(
                `Invalid server response (${response.status})`
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Failed to load stats (${response.status})`
            );

        }


        if (!data || !data.success) {

            throw new Error(
                data?.message ||
                "Statistics request failed."
            );

        }


        return data;

    },

};


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.StatsAPI = StatsAPI;
