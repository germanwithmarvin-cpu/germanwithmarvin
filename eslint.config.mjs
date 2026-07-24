import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Die neuen React-Compiler-Regeln (eslint-plugin-react-hooks v6) sind nur
      // relevant, wenn der React Compiler aktiv ist – das ist hier nicht der Fall.
      // Sie schlagen auf völlig legitime Muster an (setState im Effect für
      // localStorage-/Async-Load-Reads, die während SSR nicht laufen dürfen;
      // Zufalls-Tipp beim Mount). Deshalb aus. Bei späterer Compiler-Nutzung
      // wieder auf "error" setzen und die Stellen migrieren.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      // Unterstrich-Präfix = absichtlich ungenutzt (z. B. Kompatibilitäts-Signaturen).
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
]);

export default eslintConfig;
