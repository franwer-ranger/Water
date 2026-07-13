import { CONFIG } from "./config.js";

// Buscador estilo Google Maps (glass) sobre el geocoding de MapTiler. Al
// elegir un resultado se navega a su zona, lo que dispara la carga de
// fuentes de esa zona (buscador y datos acoplados por diseño).

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export function setupSearch(map, showToast) {
  const root = document.getElementById("search");
  const input = document.getElementById("search-input");
  const listbox = document.getElementById("search-listbox");
  const clearBtn = document.getElementById("search-clear");
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

  function updateClearBtn() {
    if (clearBtn) clearBtn.hidden = input.value.length === 0;
  }

  function setActive(index) {
    activeIndex = index;
    listbox.querySelectorAll(".search__opt").forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
      el.setAttribute("aria-selected", String(i === index));
    });
    if (index >= 0) {
      input.setAttribute("aria-activedescendant", `search-opt-${index}`);
      listbox.children[index]?.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function navigate(result) {
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

  function select(result) {
    // Deja el nombre elegido en el input, como en Google Maps.
    input.value = result.place_name || result.text || input.value;
    updateClearBtn();
    close();
    input.blur();
    // En móvil la selección se hace con el dedo (pointerdown) y preventDefault
    // solo conserva el foco: NO suprime los eventos de ratón "fantasma" que el
    // navegador sintetiza tras un toque. Como acabamos de vaciar la lista, ese
    // mousedown fantasma cae sobre el lienzo del mapa, y MapLibre lo interpreta
    // como el inicio de un gesto y aborta (map.stop) la animación de cámara en
    // curso: el flyTo lanzado de forma síncrona se cancela al instante y el
    // mapa no se mueve (en escritorio pointerdown y mousedown son el mismo
    // evento sobre la opción, sin fantasma, y funciona). Aplazamos la
    // navegación al siguiente turno del bucle de eventos, ya despachados esos
    // eventos sintéticos, para que el vuelo no se interrumpa.
    setTimeout(() => navigate(result), 0);
  }

  function open() {
    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function renderEmpty(q) {
    listbox.innerHTML = "";
    const li = document.createElement("li");
    li.className = "search__empty";
    li.textContent = `Sin resultados para “${q}”`;
    listbox.appendChild(li);
    open();
  }

  function render() {
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

      // pointerdown (no click): en móvil el click puede llegar tarde o
      // perderse tras el blur del teclado; pointerdown se dispara al
      // instante y preventDefault evita que el input pierda el foco antes.
      li.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        select(r);
      });
      li.addEventListener("mousemove", () => setActive(i));
      listbox.appendChild(li);
    });
    open();
    setActive(-1);
  }

  async function query(q) {
    const requestId = ++lastRequestId;
    try {
      // Sesgo por proximidad: prioriza resultados cercanos a lo que se ve.
      const res = await fetch(CONFIG.geocoding.url(q, map.getCenter()));
      if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
      const json = await res.json();
      if (requestId !== lastRequestId) return; // llegó tarde: hay otra en curso
      results = json.features || [];
      if (results.length === 0) {
        renderEmpty(q);
        results = [];
        activeIndex = -1;
      } else {
        render();
      }
    } catch (err) {
      if (requestId !== lastRequestId) return;
      console.error("[search]", err);
      showToast("No se pudo buscar. Inténtalo de nuevo.");
      close();
    }
  }

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    updateClearBtn();
    const q = input.value.trim();
    if (q.length < MIN_QUERY_LEN) {
      lastRequestId++; // invalida respuestas en vuelo
      close();
      return;
    }
    debounceTimer = setTimeout(() => query(q), DEBOUNCE_MS);
  });

  input.addEventListener("keydown", (e) => {
    if (listbox.hidden || results.length === 0) {
      if (e.key === "Escape") {
        close();
        input.blur();
      }
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

  if (clearBtn) {
    // pointerdown + preventDefault para no robar el foco del input.
    clearBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      input.value = "";
      lastRequestId++;
      updateClearBtn();
      close();
      input.focus();
    });
  }

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });
}
