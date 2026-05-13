import os
import math
from pydub import AudioSegment
from pydub.utils import mediainfo

def split_large_mp3s(directory_path="."):
    # 99 MB limit in bytes
    max_size_bytes = 99 * 1024 * 1024  
    
    # Target 90 MB per chunk to safely stay under the 99 MB limit
    target_size_bytes = 90 * 1024 * 1024  

    for filename in os.listdir(directory_path):
        if not filename.lower().endswith('.mp3'):
            continue

        file_path = os.path.join(directory_path, filename)
        file_size = os.path.getsize(file_path)

        if file_size > max_size_bytes:
            print(f"Processing: {filename} ({(file_size / 1024 / 1024):.2f} MB)")

            # Fetch original bitrate to maintain quality and file size ratios
            info = mediainfo(file_path)
            original_bitrate = info.get('bit_rate', '192k')

            # Calculate how many pieces are needed
            num_parts = math.ceil(file_size / target_size_bytes)

            print("  Loading audio into memory (this may take a moment)...")
            try:
                audio = AudioSegment.from_mp3(file_path)
            except Exception as e:
                print(f"  Error loading {filename}. Is ffmpeg installed? Details: {e}")
                continue
            
            # Calculate duration of each chunk in milliseconds
            chunk_duration_ms = len(audio) // num_parts
            base_name = os.path.splitext(filename)[0]

            for i in range(num_parts):
                start_time = i * chunk_duration_ms
                # For the last piece, ensure it goes all the way to the end of the file
                end_time = len(audio) if i == num_parts - 1 else (i + 1) * chunk_duration_ms

                chunk = audio[start_time:end_time]
                
                # Format: "OriginalName_1.mp3", "OriginalName_2.mp3", etc.
                output_filename = f"{base_name}_{i + 1}.mp3"
                output_filepath = os.path.join(directory_path, output_filename)

                print(f"  Exporting part {i + 1}/{num_parts}: {output_filename}")
                chunk.export(output_filepath, format="mp3", bitrate=original_bitrate)
                
            print(f"Finished splitting {filename}\n")

if __name__ == "__main__":
    # Runs the function in the current directory. 
    # You can change "." to a specific folder path like "C:/Music"
    split_large_mp3s(".")