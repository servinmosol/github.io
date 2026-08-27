from datetime import datetime

# Pega aquí unas cuantas de tu lista real para probar (he puesto 3 de ejemplo)
lista_urls = [
    "https://lanzaestudio.es/es/caso/ia-despiece-planos-bom-pymes",
    "https://lanzaestudio.es/en/case/ssr-memory-leaks-seo-optimization",
    "https://lanzaestudio.es/es/laboratorio"
]

xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
hoy = datetime.today().strftime('%Y-%m-%d')

for url in lista_urls:
    # 1. Limpiamos y pasamos al .com
    url_nueva = url.replace('https://lanzaestudio.es/es/caso/', 'https://lanzaestudio.com/caso/')
    url_nueva = url_nueva.replace('https://lanzaestudio.es/en/case/', 'https://lanzaestudio.com/en/caso/')
    url_nueva = url_nueva.replace('https://lanzaestudio.es/', 'https://lanzaestudio.com/')
    
    # 2. Nos aseguramos de que terminen en .html
    if not url_nueva.endswith('.html'):
        url_nueva += '.html'
        
    xml += f'  <url>\n    <loc>{url_nueva}</loc>\n    <lastmod>{hoy}</lastmod>\n  </url>\n'

xml += '</urlset>'

# 3. Guardamos el archivo final
with open('sitemap.xml', 'w') as file:
    file.write(xml)

print("Sitemap generado con éxito. Listo para subir a GitHub.")