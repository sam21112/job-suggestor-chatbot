from pdf2image import convert_from_path
from PIL import Image
import PIL

images=convert_from_path("Resume_samarth_raipal.pdf")
images=images.save("Resume_samarth_raipal.png")
