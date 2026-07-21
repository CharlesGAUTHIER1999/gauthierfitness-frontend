import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import {defineConfig, globalIgnores} from "eslint/config";

export default defineConfig([// Ignore build + deps
    globalIgnores(["dist", "node_modules", "coverage"]),

    {
        files: ["**/*.{js,jsx}"],
        extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite,],
        languageOptions: {
            ecmaVersion: "latest", globals: globals.browser, parserOptions: {
                ecmaFeatures: {jsx: true}, sourceType: "module",
            },
        },
        rules: {
            // Allows unused variables
            "no-unused-vars": ["error", {
                varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_",
            },],

            // Hooks - exhaustive-deps as a warning
            "react-hooks/exhaustive-deps": "warn",

            // React Compiler rules too strict for this project
            "react-hooks/set-state-in-effect": "off", "react-hooks/preserve-manual-memoization": "off",

            // React Refresh - exported hooks allowed
            "react-refresh/only-export-components": ["warn", {allowConstantExport: true},],
        },
    },

    // Tests Jest
    // Globals describe/it/expect/jest/beforeEach + authorize empty catch (_)
    {
        files: ["**/*.test.{js,jsx}", "tests/**/*.{js,jsx}", "__mocks__/**/*.{js,jsx}",], languageOptions: {
            globals: {
                ...globals.browser, ...globals.jest, ...globals.node,
            },
        }, rules: {
            "no-unused-vars": ["error", {
                varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_",
            },],
        },
    },]);