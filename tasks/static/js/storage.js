import { state } from "./state.js";

export function saveState() {

    localStorage.setItem(
        "todo-game-state",
        JSON.stringify(state)
    );

}

export function loadState() {

    const savedState =
        localStorage.getItem(
            "todo-game-state"
        );

    if (!savedState) return;

    const parsedState =
        JSON.parse(savedState);

    Object.assign(
        state,
        parsedState
    );

}