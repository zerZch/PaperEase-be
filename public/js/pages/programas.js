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
  });