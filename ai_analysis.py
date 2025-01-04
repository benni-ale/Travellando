from PIL import Image
import numpy as np
from transformers import ViTFeatureExtractor, ViTForImageClassification
import torch

def analyze_image(image_path):
    # Load the image
    image = Image.open(image_path)

    # Initialize the feature extractor and model
    feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
    model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')

    # Preprocess the image
    inputs = feature_extractor(images=image, return_tensors="pt")

    # Perform inference
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get the predicted class
    logits = outputs.logits
    predicted_class_idx = logits.argmax(-1).item()
    predicted_class = model.config.id2label[predicted_class_idx]

    # Return the analysis result
    analysis_result = {
        "predicted_class": predicted_class
    }
    return analysis_result 