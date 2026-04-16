import sys
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for white: RGB > 240
    for item in datas:
        # Check if pixel is close to white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print("Done")

if __name__ == "__main__":
    make_transparent("public/logo.png", "public/logo.png")
