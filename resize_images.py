import os
from PIL import Image, ImageOps

def process_images():
    # Target sizes (Width, Height)
    sizes = {
        "260x345": (260, 345),
        "600x600": (600, 600)
    }

    # Get the current directory where the script is running
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(current_dir, "optimized_for_web")

    # Create an output folder if it doesn't already exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Loop through all files in the current directory
    for filename in os.listdir(current_dir):
        # Process only PNG files
        if filename.lower().endswith(".png"):
            file_path = os.path.join(current_dir, filename)
            
            try:
                # Open the image
                with Image.open(file_path) as img:
                    print(f"Processing: {filename}...")
                    
                    for size_name, dimensions in sizes.items():
                        # ImageOps.fit resizes and crops to the exact dimensions without distortion
                        # LANCZOS is a high-quality downsampling filter
                        resized_img = ImageOps.fit(img, dimensions, Image.Resampling.LANCZOS)
                        
                        # Create a new filename (e.g., image1_260x345.png)
                        name, ext = os.path.splitext(filename)
                        new_filename = f"{name}_{size_name}{ext}"
                        output_path = os.path.join(output_dir, new_filename)
                        
                        # Save the image with optimization to reduce file size
                        resized_img.save(output_path, format="PNG", optimize=True)
                        print(f"  -> Saved: {new_filename}")
                        
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    print("\nAll done! Check the 'optimized_for_web' folder for your images.")

if __name__ == "__main__":
    process_images()