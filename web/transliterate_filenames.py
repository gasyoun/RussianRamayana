import os

def transliterate(text):
    # Standard Russian to Latin dictionary, now including space to underscore
    mapping = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '_'  # <--- Added rule: replaces space with underscore
    }
    
    # Replace Cyrillic characters and spaces, keep other characters as they are
    return ''.join(mapping.get(char, char) for char in text)

def rename_files():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    renamed_count = 0
    
    # Loop through all files in the directory
    for filename in os.listdir(current_dir):
        # Skip the script file itself
        if filename == os.path.basename(__file__):
            continue
            
        new_filename = transliterate(filename)
        
        # Only rename if the filename actually changed (Cyrillic characters or spaces)
        if new_filename != filename:
            old_path = os.path.join(current_dir, filename)
            new_path = os.path.join(current_dir, new_filename)
            
            # Prevent overwriting an existing file with the same transliterated name
            if os.path.exists(new_path):
                print(f"Skipped: '{filename}' (A file named '{new_filename}' already exists)")
                continue
                
            try:
                os.rename(old_path, new_path)
                print(f"Renamed: '{filename}' -> '{new_filename}'")
                renamed_count += 1
            except Exception as e:
                print(f"Error renaming '{filename}': {e}")
                
    print(f"\nDone! Successfully renamed {renamed_count} files.")

if __name__ == "__main__":
    rename_files()