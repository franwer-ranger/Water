import { defineConfig } from "vite";

// Rutas relativas para que el build funcione tanto en el dominio propio
// (CNAME) como bajo https://<usuario>.github.io/<repo>/.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});
