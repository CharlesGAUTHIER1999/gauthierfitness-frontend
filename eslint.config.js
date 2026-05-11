import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignore build + deps (utile si un jour tu changes la config ou tooling)
  globalIgnores(["dist", "node_modules", "coverage"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Autorise les variables volontairement non utilisées: _err, _unused, etc.
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_",
        },
      ],

      // Hooks — exhaustive-deps en warning (intentionnel dans certains effets)
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh — les hooks exportés (useAuth, etc.) sont autorisés
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);
