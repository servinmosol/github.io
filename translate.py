import os
import json
import time
from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='es', target='fr')

directory = 'datos-casos/fr/'
role_cache = {}

for filename in os.listdir(directory):
    if filename.endswith(".json"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        changed = False

        # Translate author_role
        if 'author_role' in data and data['author_role']:
            role = data['author_role']
            if role not in role_cache:
                try:
                    # we can force to translate assuming it is Spanish
                    translated = translator.translate(role)
                    role_cache[role] = translated
                    time.sleep(1)
                except Exception as e:
                    print(f"Error translating role {role}: {e}")
                    role_cache[role] = role

            if role_cache[role] != role:
                data['author_role'] = role_cache[role]
                changed = True

        # Translate author_pitch
        if 'author_pitch' in data and data['author_pitch']:
            pitch = data['author_pitch']
            # Only translate if it looks like Spanish
            # Wait, `translator.translate` works even if we blindly send it,
            # BUT sometimes deep-translator fails on very large files or rate limits without raising?
            # actually we can check if there are specific Spanish words, or just translate all.
            try:
                translated_pitch = translator.translate(pitch)
                if translated_pitch != pitch:
                    # Fix brand name translations just in case
                    translated_pitch = translated_pitch.replace('lance un studio', 'Lanza Estudio')
                    translated_pitch = translated_pitch.replace('Lance un studio', 'Lanza Estudio')
                    data['author_pitch'] = translated_pitch
                    changed = True
                time.sleep(1)
            except Exception as e:
                print(f"Error translating pitch in {filename}: {e}")

        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"Translated {filename}")

print("Done")
