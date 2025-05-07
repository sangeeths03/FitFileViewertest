import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import { defineConfig } from "eslint-define-config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["electron-app/libs/**"],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ["**/*.css"],
    ignores: ["electron-app/libs/**"],
    ...css.configs.recommended,
  },
]);