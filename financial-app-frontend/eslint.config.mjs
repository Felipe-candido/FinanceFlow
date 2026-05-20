import js from "@eslint/js"
import tseslint from "typescript-eslint"

const browserGlobals = {
  Blob: "readonly",
  crypto: "readonly",
  document: "readonly",
  fetch: "readonly",
  File: "readonly",
  FormData: "readonly",
  globalThis: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  URL: "readonly",
  window: "readonly",
}

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: browserGlobals,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_|actionTypes",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
)
