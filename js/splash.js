// Pantalla de carga inicial.
//
// El markup vive en `index.html` para que se vea desde el primer frame (sin
// esperar al bundle). Aquí solo se controla cuándo desaparece: cuando termina
// la primera carga de datos —con o sin error— o al agotarse la duración
// mínima, lo que ocurra más tarde.

const MIN_DURATION_MS = 2000;
const FADE_MS = 420;

export function setupSplash() {
  const el = document.getElementById("splash");
  if (!el) return { hide: () => {} };

  const startedAt = performance.now();
  let hiding = false;

  return {
    hide() {
      if (hiding) return;
      hiding = true;
      const remaining = Math.max(
        0,
        MIN_DURATION_MS - (performance.now() - startedAt)
      );
      setTimeout(() => {
        el.classList.add("is-hidden");
        // Fuera del DOM al acabar el fundido: no debe capturar clicks ni
        // quedarse en el árbol de accesibilidad.
        setTimeout(() => el.remove(), FADE_MS);
      }, remaining);
    },
  };
}
