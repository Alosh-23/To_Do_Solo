/**
 * ==========================================================
 * TO DO SOLO
 * MISSION API
 * ==========================================================
 */

const MissionAPI = {

    async getMissions() {

        return requestMissionJSON(
            "/api/missions/"
        );

    },


    async getMission(id) {

        return requestMissionJSON(
            `/api/missions/${id}/`
        );

    },


    async completeMission(id) {

        return requestMissionJSON(
            `/api/missions/${id}/complete/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken":
                        getCSRFToken(),
                },
            }
        );

    },

};


async function requestMissionJSON(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                credentials: "same-origin",

                headers: {
                    "Accept": "application/json",
                    ...(options.headers || {}),
                },

                ...options,
            }
        );


    const data =
        await response.json()
            .catch(() => null);


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.detail ||
            `Mission request failed (${response.status})`
        );

    }


    return data;

}


function getCSRFToken() {

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
            cookie.split("=")[1]
        )
        : "";

}


window.MissionAPI =
    MissionAPI;