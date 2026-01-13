(function() {
  /* ======================================================================
     1. DIBUJAR TARJETAS (DISEÑO VINILO + ENLACES CORREGIDOS)
     ====================================================================== */
  var displaySearchResults = function(results, store) {
    var searchResults = document.getElementById('cb-browse-results-target');

    if (results.length) {
      var appendString = '<div class="row">';

      for (var i = 0; i < results.length; i++) {
        var item = store[results[i].ref];
        
        // ENLACE
        var itemHref = "/item.html?id=" + results[i].ref;

        // IMAGEN
        var imgUrl = item.image || item.filename;
        if (imgUrl && !imgUrl.includes('/') && !imgUrl.includes('http')) {
            imgUrl = '/objects/' + imgUrl;
        }

        // GÉNEROS
        var genreHtml = '';
        if (item.subject) {
            var tags = item.subject.split(';').slice(0,2);
            tags.forEach(function(tag) {
                genreHtml += '<span class="badge me-1" style="background:rgba(255,255,255,0.1); font-weight:normal; margin-right:5px;">' + tag.trim() + '</span>';
            });
            genreHtml = '<div class="mt-2">' + genreHtml + '</div>';
        }

        // VINILO (Condicional)
        var vinylHtml = '';
        var itemFormat = (item.formato_fisico || item.format || "").toLowerCase();
        // Si el formato incluye "vinilo", mostramos el disco
        if (itemFormat.includes('vinilo') || itemFormat.includes('vinyl')) {
            vinylHtml = '<img src="/assets/img/vinyl.png" class="vinyl-disk" alt="Vinyl">';
        }

        // HTML
        appendString += `
        <div class="col-lg-4 col-md-6 col-sm-12 mb-5 album-card-col">
            <a href="${itemHref}" class="no-hover-line">
                <div class="spotify-card">
                    <div class="album-wrapper">
                        ${vinylHtml}
                        <img class="album-cover" src="${imgUrl}" alt="${item.title}">
                    </div>
                    <div class="text-container">
                        <div class="album-title">${item.title}</div>
                        <div class="album-artist">${item.creator || ''}</div>
                        ${genreHtml}
                    </div>
                </div>
            </a>
        </div>
        `;
      }

      appendString += '</div>';
      searchResults.innerHTML = appendString;
    } else {
      searchResults.innerHTML = '<div class="col-12 text-center mt-5"><h5 class="text-white">No hay resultados</h5><p class="text-muted">Prueba a cambiar el filtro.</p></div>';
    }
    
    var spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }

  /* ======================================================================
     2. CONFIGURACIÓN DEL BUSCADOR (LUNR)
     ====================================================================== */
  var idx = lunr(function () {
    this.field('id');
    this.field('title', { boost: 10 });
    this.field('creator');
    this.field('subject');
    this.field('formato_fisico'); // Indexamos tu columna clave

    for (var key in window.store) {
      this.add({
        'id': key,
        'title': window.store[key].title,
        'creator': window.store[key].creator,
        'subject': window.store[key].subject,
        'formato_fisico': window.store[key].formato_fisico
      });
    }
  });

  /* ======================================================================
     3. LÓGICA DE FILTRADO (CORREGIDA PARA TU CONFIGURACIÓN)
     ====================================================================== */
  function filterItems() {
    var searchTerm = document.getElementById('search-input') ? document.getElementById('search-input').value : "";
    
    // --- AQUÍ ESTABA EL ERROR ---
    // CollectionBuilder genera el ID basado en el nombre de la columna en _config.yml
    // Como tu columna es "formato_fisico", el ID es "formato_fisico-select"
    var formatSelect = document.getElementById('formato_fisico-select'); 
                       
    var formatValue = formatSelect ? formatSelect.value : "";

    // 1. Obtener resultados de texto
    var results;
    if (searchTerm) {
      results = idx.search(searchTerm);
    } else {
      results = Object.keys(window.store).map(function(k){ return {ref: k}; });
    }

    // 2. Filtrar por Formato
    // Comprobamos si hay un valor seleccionado y que no sea el valor por defecto (vacío o todas las opciones)
    if (formatValue && formatValue !== "") {
      // Normalizamos el filtro (ej: "Vinilo" -> "vinilo")
      var filterTerm = formatValue.toLowerCase().trim();
      
      results = results.filter(function(result) {
        var item = window.store[result.ref];
        // Buscamos en tu columna específica
        var itemFormat = (item.formato_fisico || "").toLowerCase();
        
        // Usamos 'includes' para que "Vinilo" encuentre "Digital/CD/Vinilo"
        return itemFormat.includes(filterTerm);
      });
    }

    displaySearchResults(results, window.store);
  }

  // --- EVENT LISTENERS ---

  var searchInput = document.getElementById('search-input');
  if (searchInput) {
      searchInput.addEventListener('keyup', filterItems);
  }

  // Listener específico para TU filtro
  var formatSelect = document.getElementById('formato_fisico-select');
  if (formatSelect) {
      formatSelect.addEventListener('change', filterItems);
  }
  
  // Carga inicial
  filterItems();

})();