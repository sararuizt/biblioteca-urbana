module Jekyll
  class ItemPageGenerator < Generator
    safe true

    def generate(site)
      # 1. Busca tus datos (el nombre del archivo CSV sin extensión)
      # Si tu archivo se llama demo-metadata.csv, esto debe ser 'demo-metadata'
      data = site.data['demo-metadata']

      if data
        data.each do |item|
          # 2. Crea la página para cada item en la carpeta /items/
          site.pages << ItemPage.new(site, site.source, 'items', item)
        end
      end
    end
  end

  class ItemPage < Page
    def initialize(site, base, dir, item)
      @site = site
      @base = base
      @dir  = dir
      @name = "#{item['objectid']}.html" # El nombre será item001.html

      self.process(@name)
      # Usamos tu diseño de _layouts/item.html como plantilla
      self.read_yaml(File.join(base, '_layouts'), 'item.html')

      # Pasamos todos los datos del Excel a la página
      self.data.merge!(item)
      self.data['title'] = item['title']
    end
  end
end