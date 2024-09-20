import globals from "globals"
import pluginJs from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import prettier from "eslint-plugin-prettier" // Import Prettier plugin
import prettierConfig from "eslint-config-prettier" // Prettier config

export default [
    { files: ["**/*.{js,mjs,cjs,vue}"] },
    {
        languageOptions: {
            ecmaVersion: "latest",
            globals: { ...globals.browser, ...globals.node },
        },
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs["flat/essential"],

    // Use Prettier config directly
    prettierConfig,

    {
        plugins: {
            prettier, // Assign Prettier plugin as an object
        },
        rules: {
            semi: ["error", "never"],
            "prettier/prettier": ["error"],
        },
    },
]
