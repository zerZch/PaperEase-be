document.addEventListener("DOMContentLoaded", () => {
    // Inicializar iconos Lucide
    lucide.replace();
  
    // Mostrar solo las tarjetas de la pestaña activa al cargar
    document.querySelector(".tabs .tab.active")?.click();
  
    // Función de acordeón: solo una tarjeta activa
    document.querySelectorAll(".card-header").forEach(header => {
      header.addEventListener("click", () => {
        const card = header.closest(".requisito-card");
        document.querySelectorAll(".requisito-card.active").forEach(c => {
          if (c !== card) c.classList.remove("active");
        });
        card.classList.toggle("active");
      });
    });
  
    // Filtrado por pestañas
    document.querySelectorAll(".tabs .tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tabs .tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const cat = tab.dataset.cat;
  
        document.querySelectorAll(".requisito-card").forEach(card => {
          card.style.display = card.dataset.cat === cat ? "block" : "none";
        });
  
        // Opcional: mejora visual del grid
        document.querySelector(".requisitos-grid").style.alignContent = "start";
      });
    });

    document.addEventListener("click", event => {
      const applyLink = event.target.closest('a[href*="formulario.html"]');
      if (!applyLink) return;

      const target = new URL(applyLink.getAttribute("href"), window.location.origin);
      const tipo = target.searchParams.get("tipo");
      const programa = target.searchParams.get("programa");
      if (!tipo || !programa) return;

      const destination = `/formulario.html?tipo=${encodeURIComponent(tipo)}&programa=${encodeURIComponent(programa)}`;

      if (typeof isAuthenticated === "function" && !isAuthenticated()) {
        event.preventDefault();
        localStorage.setItem("postAuthRedirect", destination);
        window.location.href = "/registro.html";
        return;
      }

      applyLink.setAttribute("href", destination);
    });
  });
