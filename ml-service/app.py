from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import io
import hashlib
import base64
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)

app = Flask(__name__)

# Create a dummy/mock model for testing (replace with actual trained model later)
def create_dummy_model():
    """
    Creates a simple functional model that:
    - Takes image (256,256,1) and watermark (64,64,1) as inputs
    - Returns watermarked image and extracted watermark as outputs
    - For testing purposes only
    """
    from tensorflow.keras import layers, Model
    
    # Input layers
    image_input = layers.Input(shape=(256, 256, 1), name='image_input')
    watermark_input = layers.Input(shape=(64, 64, 1), name='watermark_input')
    
    # Simple processing for image (mock encoding)
    x = layers.Conv2D(16, 3, padding='same')(image_input)
    x = layers.ReLU()(x)
    watermarked_output = layers.Conv2D(1, 3, padding='same')(x)
    
    # Simple processing for watermark (mock decoding)
    w = layers.Flatten()(watermark_input)
    w = layers.Dense(128)(w)
    w = layers.ReLU()(w)
    w = layers.Reshape((64, 64, 1))(layers.Dense(4096)(w))
    
    model = Model(inputs=[image_input, watermark_input], outputs=[watermarked_output, w])
    return model

try:
    print("Loading model...")
    model = create_dummy_model()
    print("✅ Dummy model created successfully for testing")
except Exception as e:
    print(f"❌ Error creating model: {e}")
    raise

# Helper: Convert metadata to binary watermark (4096 bits, reshaped to 64x64x1)
def metadata_to_watermark(patient_id, timestamp):
    data = f"{patient_id}:{timestamp}"
    hash_obj = hashlib.sha256(data.encode())
    binary = bin(int(hash_obj.hexdigest(), 16))[2:].zfill(4096)[:4096]
    watermark_flat = np.array([int(b) for b in binary], dtype=np.float32)
    return watermark_flat.reshape((64, 64, 1))

# Helper: Preprocess image for model (grayscale, resize to 256x256x1)
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('L').resize((256, 256))
    return np.array(img).reshape((256, 256, 1)) / 255.0

@app.route('/encode', methods=['POST'])
def encode():
    if 'image' not in request.files or 'metadata' not in request.form:
        return jsonify({'error': 'Missing image or metadata'}), 400
    
    image_file = request.files['image']
    metadata = request.form.get('metadata')
    import json
    meta_dict = json.loads(metadata)
    watermark = metadata_to_watermark(meta_dict['patient_id'], meta_dict['timestamp'])
    
    img_array = preprocess_image(image_file.read())
    watermarked = model.predict([np.expand_dims(img_array, axis=0), np.expand_dims(watermark, axis=0)])[0]
    
    watermarked_img = Image.fromarray((watermarked.squeeze() * 255).astype(np.uint8), mode='L')
    img_bytes = io.BytesIO()
    watermarked_img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    watermark_hash = hashlib.sha256(watermark.tobytes()).hexdigest()
    
    return jsonify({'watermarked_image': base64.b64encode(img_bytes.getvalue()).decode('utf-8'), 'watermark_hash': watermark_hash})

@app.route('/decode', methods=['POST'])
def decode():
    if 'image' not in request.files:
        return jsonify({'error': 'Missing image'}), 400
    
    image_file = request.files['image']
    img_array = preprocess_image(image_file.read())
    
    dummy_watermark = np.zeros((64, 64, 1), dtype=np.float32)
    extracted_watermark = model.predict([np.expand_dims(img_array, axis=0), np.expand_dims(dummy_watermark, axis=0)])[1]
    
    extracted_hash = hashlib.sha256(extracted_watermark.tobytes()).hexdigest()
    
    return jsonify({'extracted_watermark_hash': extracted_hash})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
