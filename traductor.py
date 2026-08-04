import os
import json
import time
import re
from unidecode import unidecode
from openai import OpenAI
from dotenv import load_dotenv

# ==========================================
# CONFIGURACIÓN DEL IDIOMA (Cámbialo aquí para cada ronda)
# ==========================================
CODIGO_IDIOMA = "pt"           # Opciones: 'it', 'nl', 'pt'
NOMBRE_IDIOMA = "Portugués"     # Opciones: 'Italiano', 'Neerlandés', 'Portugués'

# ==========================================

load_dotenv()
clave_api = os.getenv("OPENAI_API_KEY")

if not clave_api:
    raise ValueError("❌ ERROR: No se ha encontrado la OPENAI_API_KEY en el archivo .env")

client = OpenAI(api_key=clave_api)

INPUT_DIR = 'datos-casos/es'
OUTPUT_DIR = f'datos-casos/{CODIGO_IDIOMA}'

def slugify(text):
    text = unidecode(text).lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def traducir_archivo(datos_es):
    prompt_sistema = f"""
    Eres un traductor experto de Español a {NOMBRE_IDIOMA} técnico y de negocios (B2B).
    Recibirás un objeto JSON. Tu tarea es traducir los valores al {NOMBRE_IDIOMA.upper()} y devolver un objeto JSON válido.
    
    REGLA DE ORO PARA EL CAMPO 'body': Contiene código HTML. DEBES mantener todas las etiquetas HTML exactas (<p>, <h3>, <ul>, <strong>, etc.) intactas y en su lugar. Traduce ÚNICAMENTE el texto que hay entre las etiquetas.
    
    Traduce: seo_title, seo_desc, category, title, author_role, author_pitch, service_tag y body.
    Devuelve SOLO el JSON, sin formato markdown adicional.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": json.dumps(datos_es, ensure_ascii=False)}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Error en OpenAI: {e}")
        return None

def iniciar_traduccion():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    archivos_completados = set()
    for f_dest in os.listdir(OUTPUT_DIR):
        if f_dest.endswith('.json'):
            try:
                with open(os.path.join(OUTPUT_DIR, f_dest), 'r', encoding='utf-8') as dest:
                    datos_de = json.load(dest)
                    if 'service_tag_hreflang' in datos_de:
                        archivos_completados.add(datos_de['service_tag_hreflang'])
            except:
                continue

    archivos = [f for f in os.listdir(INPUT_DIR) if f.endswith('.json')]
    total = len(archivos)
    
    print(f"🚀 Iniciando traducción a {NOMBRE_IDIOMA}. Archivos totales: {total}")
    print(f"✅ Ya traducidos detectados: {len(archivos_completados)}")

    for i, archivo in enumerate(archivos):
        ruta_es = os.path.join(INPUT_DIR, archivo)
        
        with open(ruta_es, 'r', encoding='utf-8') as f:
            datos_es = json.load(f)
            
        slug_original = datos_es.get('service_tag', '')
        
        if slug_original in archivos_completados:
            print(f"⏭️  Saltando {i+1}/{total} (Ya existe): {archivo}")
            continue

        print(f"⚙️  Traduciendo {i+1}/{total}: {archivo}...")
        
        datos_a_traducir = {
            "seo_title": datos_es.get("seo_title", ""),
            "seo_desc": datos_es.get("seo_desc", ""),
            "category": datos_es.get("category", ""),
            "title": datos_es.get("title", ""),
            "author_role": datos_es.get("author_role", ""),
            "author_pitch": datos_es.get("author_pitch", ""),
            "service_tag": datos_es.get("service_tag", ""),
            "body": datos_es.get("body", "")
        }

        datos_traducidos = traducir_archivo(datos_a_traducir)
        
        if datos_traducidos:
            json_final = datos_es.copy()
            json_final['service_tag_hreflang'] = slug_original
            nuevo_slug = slugify(datos_traducidos.get('service_tag', slug_original))
            json_final['service_tag'] = nuevo_slug
            
            json_final['seo_title'] = datos_traducidos.get('seo_title', '')
            json_final['seo_desc'] = datos_traducidos.get('seo_desc', '')
            json_final['category'] = datos_traducidos.get('category', '')
            json_final['title'] = datos_traducidos.get('title', '')
            json_final['author_role'] = datos_traducidos.get('author_role', '')
            json_final['author_pitch'] = datos_traducidos.get('author_pitch', '')
            json_final['body'] = datos_traducidos.get('body', '')
            
            nombre_archivo_nuevo = f"{nuevo_slug}.json"
            ruta_de = os.path.join(OUTPUT_DIR, nombre_archivo_nuevo)
            
            with open(ruta_de, 'w', encoding='utf-8') as f:
                json.dump(json_final, f, ensure_ascii=False, indent=4)
                
            print(f"✅ Guardado: {nombre_archivo_nuevo}")
        
        time.sleep(0.5)

    print(f"🎉 ¡PROCESO DE {NOMBRE_IDIOMA.upper()} COMPLETADO!")

if __name__ == "__main__":
    iniciar_traduccion()