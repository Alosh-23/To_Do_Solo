/**
 * ==========================================================
 * TO DO SOLO
 * ACHIEVEMENTS
 * ==========================================================
 */

const ToDoSoloAchievements = {

    items: [],


    /**
     * ======================================================
     * ACHIEVEMENT DEFINITIONS
     * ======================================================
     */

    definitions: {

        first_step: {

            key:
                "first_step",

            title: {
                en: "First Step",
                ar: "الخطوة الأولى",
            },

        },

        task_starter: {

            key:
                "task_starter",

            title: {
                en: "Task Starter",
                ar: "بداية المهام",
            },

        },

        task_master: {

            key:
                "task_master",

            title: {
                en: "Task Master",
                ar: "سيد المهام",
            },

        },

        xp_hunter: {

            key:
                "xp_hunter",

            title: {
                en: "XP Hunter",
                ar: "صياد XP",
            },

        },

        level_up: {

            key:
                "level_up",

            title: {
                en: "Level Up",
                ar: "ارتقاء المستوى",
            },

        },

        streak_starter: {

            key:
                "streak_starter",

            title: {
                en: "Streak Starter",
                ar: "بداية التتابع",
            },

        },

        week_warrior: {

            key:
                "week_warrior",

            title: {
                en: "Week Warrior",
                ar: "محارب الأسبوع",
            },

        },

    },


    /**
     * ======================================================
     * SET ITEMS
     * ======================================================
     */

    set(items) {

        this.items =
            Array.isArray(items)
                ? items
                : [];


        return this.items;

    },


    /**
     * ======================================================
     * GET ALL
     * ======================================================
     */

    getAll() {

        return [
            ...this.items
        ];

    },


    /**
     * ======================================================
     * GET BY KEY
     * ======================================================
 */

    getByKey(key) {

        return this.items.find(
            achievement =>
                achievement.key === key
        ) || null;

    },


    /**
     * ======================================================
     * GET UNLOCKED
     * ======================================================
     */

    getUnlocked() {

        return this.items.filter(
            achievement =>
                Boolean(
                    achievement.unlocked
                )
        );

    },


    /**
     * ======================================================
     * GET LOCKED
     * ======================================================
     */

    getLocked() {

        return this.items.filter(
            achievement =>
                !achievement.unlocked
        );

    },


    /**
     * ======================================================
     * COUNT
     * ======================================================
     */

    countUnlocked() {

        return this.getUnlocked().length;

    },


    countTotal() {

        return this.items.length;

    },


    /**
     * ======================================================
     * PROGRESS
     * ======================================================
     */

    getProgress() {

        const total =
            this.countTotal();


        const unlocked =
            this.countUnlocked();


        if (!total) {

            return 0;

        }


        return Math.round(
            (
                unlocked /
                total
            ) * 100
        );

    },


    /**
     * ======================================================
     * LOCALIZE TITLE
     * ======================================================
     */

    getTitle(
        achievement,
        language = "en"
    ) {

        if (!achievement) {

            return "";

        }


        const definition =
            this.definitions[
                achievement.key
            ];


        if (!definition) {

            return (
                achievement.label ||
                achievement.key ||
                ""
            );

        }


        return (
            definition.title[language] ||
            definition.title.en
        );

    },


    /**
     * ======================================================
     * NORMALIZE API DATA
     * ======================================================
     */

    normalize(
        achievements
    ) {

        if (
            !Array.isArray(
                achievements
            )
        ) {

            return [];

        }


        return achievements.map(
            achievement => ({

                id:
                    achievement.id ??
                    null,

                key:
                    achievement.key ??
                    "",

                unlocked:
                    Boolean(
                        achievement.unlocked
                    ),

                unlocked_at:
                    achievement.unlocked_at ??
                    null,

                label:
                    achievement.label ??
                    "",

            })
        );

    },


    /**
     * ======================================================
     * SET FROM API
     * ======================================================
     */

    setFromAPI(
        achievements
    ) {

        const normalized =
            this.normalize(
                achievements
            );


        this.set(
            normalized
        );


        return normalized;

    },

};


window.ToDoSoloAchievements =
    ToDoSoloAchievements;

