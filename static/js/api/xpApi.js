/**
 * ==========================================================
 * TO DO SOLO
 * XP API
 * ==========================================================
 */

const XPAPI = {

    async getXP() {

        return requestXPJSON(
            "/api/xp/"
        );

    },


    async addXP(
        amount
    ) {

        return requestXPJSON(
            "/api/xp/add/",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "X-CSRFToken":
                        getXPCSRFToken(),
                },

                body:
                    JSON.stringify({
                        amount:
                            Number(amount) || 0,
                    }),
            }
        );

    },

};


async function requestXPJSON(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                credentials: "same-origin",

                headers: {
                    "Accept":
                        "application/json",

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
            `XP request failed (${response.status})`
        );

    }


    return data;

}


function getXPCSRFToken() {

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


window.XPAPI =
    XPAPI;