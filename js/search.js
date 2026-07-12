import { CONFIG } from "./config.js";

// Buscador estilo Google Maps (glass) sobre el geocoding de MapTiler. Al
// elegir un resultado se navega a su zona con fitBounds, lo que dispara la
// carga de fuentes de esa zona (buscador y datos acoplados por diseño).

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export function setupSearch(map, showToast) {
  const root = document.getElementById("search");
  const input = document.getElementById("search-input");
  const listbox = document.getElementById("search-listbox");
  if (!root || !input || !listbox) return;

  // Sin clave de MapTiler no hay geocoding: se oculta el buscador.
  if (!CONFIG.geocoding.enabled) {
    root.hidden = true;
    return;
  }

  let results = [];
  let activeIndex = -1;
  let debounceTimer;
  let lastRequestId = 0;

  function close() {
    listbox.hidden = true;
    listbox.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    results = [];
    activeIndex = -1;
  }

  function setActive(index) {
    activeIndex = index;
    listbox.querySelectorAll(".search__opt").forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
    });
    if (index >= 0) {
      input.setAttribute("aria-activedescendant", `search-opt-${index}`);
      listbox.children[index]?.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function select(result) {
    close();
    input.blur();
    if (result.bbox) {
      const camera = map.cameraForBounds(
        [
          [result.bbox[0], result.bbox[1]],
          [result.bbox[2], result.bbox[3]],
        ],
        { padding: 40, maxZoom: 16 }
      );
      if (camera) {
        // Nunca por debajo del zoom de carga de datos: buscar una zona debe
        // enseñar sus fuentes siempre.
        camera.zoom = Math.max(camera.zoom, CONFIG.minDataZoom);
        map.flyTo({ ...camera, essential: true });
        return;
      }
    }
    if (result.center) {
      map.flyTo({ center: result.center, zoom: 14, essential: true });
    }
  }

  function render() {
    if (results.length === 0) {
      close();
      return;
    }
    listbox.innerHTML = "";
    results.forEach((r, i) => {
      const li = document.createElement("li");
      li.id = `search-opt-${i}`;
      li.className = "search__opt";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");

      const name = document.createElement("span");
      name.className = "search__opt-name";
      name.textContent = r.text || r.place_name;
      li.appendChild(name);

      const context = (r.place_name || "")
        .split(",")
        .slice(1)
        .join(",")
        .trim();
      if (context) {
        const ctx = document.createElement("span");
        ctx.className = "search__opt-ctx";
        ctx.textContent = context;
        li.appendChild(ctx);
      }

      // mousedown en vez de click: se dispara antes del blur del input.
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select(r);
      });
      li.addEventListener("mousemove", () => setActive(i));
      listbox.appendChild(li);
    });
    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
    setActive(-1);
  }

  async function query(q) {
    const requestId = ++lastRequestId;
    try {
      const res = await fetch(CONFIG.geocoding.url(q));
      if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
      const json = await res.json();
      if (requestId !== lastRequestId) return; // llegó tarde: hay otra en curso
      results = json.features || [];
      render();
    } catch (err) {
      if (requestId !== lastRequestId) return;
      console.error("[search]", err);
      showToast("No se pudo buscar. Inténtalo de nuevo.");
      close();
    }
  }

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < MIN_QUERY_LEN) {
      lastRequestId++; // invalida respuestas en vuelo
      close();
      return;
    }
    debounceTimer = setTimeout(() => query(q), DEBOUNCE_MS);
  });

  input.addEventListener("keydown", (e) => {
    if (listbox.hidden) {
      if (e.key === "Escape") input.blur();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((activeIndex + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((activeIndex - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        select(results[activeIndex >= 0 ? activeIndex : 0]);
        break;
      case "Escape":
        close();
        break;
    }
  });

  // Reabre las sugerencias al volver al input con texto ya escrito.
  input.addEventListener("focus", () => {
    if (results.length > 0) render();
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });
}
