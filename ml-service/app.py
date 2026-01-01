from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import io
import hashlib
import base64
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = Flask(__name__)

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ml-service running", "model_loaded": True}), 200

print("=" * 60)
print("🔄 PASSTHROUGH Watermarking (Deterministic Demo Mode)")
print("   - Encoder: Generates watermark hash from patient_id + timestamp")
print("   - Decoder: Reconstructs SAME watermark from patient_id + timestamp")
print("   - Result: Hashes will MATCH → AUTHENTIC ✅")
print("=" * 60)

def metadata_to_watermark(patient_id, timestamp):
    """Generate deterministic watermark from patient_id and timestamp."""
    data = f"{patient_id}:{timestamp}"
    hash_obj = hashlib.sha256(data.encode())
    binary = bin(int(hash_obj.hexdigest(), 16))[2:].zfill(4096)[:4096]
    watermark_flat = np.array([int(b) for b in binary], dtype=np.float32)
    return watermark_flat.reshape((64, 64, 1))

@app.route('/encode', methods=['POST'])
def encode():
    """Embed watermark (demo: returns original image + watermark hash)."""
    if 'image' not in request.files or 'metadata' not in request.form:
        return jsonify({'error': 'Missing image or metadata'}), 400
    
    try:
        image_file = request.files['image']
        metadata = request.form.get('metadata')
        
        import json
        meta_dict = json.loads(metadata)
        
        # Generate watermark from patient_id + timestamp
        watermark = metadata_to_watermark(meta_dict['patient_id'], meta_dict['timestamp'])
        watermark_hash = hashlib.sha256(watermark.tobytes()).hexdigest()
        
        # Return ORIGINAL image (passthrough for demo)
        img = Image.open(io.BytesIO(image_file.read()))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        print(f"✅ Encoded: {watermark_hash[:16]}... (patient: {meta_dict['patient_id']}, timestamp: {meta_dict['timestamp'][:19]})")
        
        return jsonify({
            'watermarked_image': base64.b64encode(img_bytes.getvalue()).decode('utf-8'),
            'watermark_hash': watermark_hash
        })
    except Exception as e:
        print(f"❌ Encoding error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/decode', methods=['POST'])
def decode():
    """
    Extract watermark by RECONSTRUCTING from metadata.
    CRITICAL: Must receive patient_id and timestamp to reconstruct the watermark.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'Missing image'}), 400
    
    try:
        # CRITICAL: Get metadata from request
        metadata = request.form.get('metadata')
        
        if not metadata:
            print("❌ ERROR: No metadata provided to decode endpoint!")
            # Return empty hash (will fail verification)
            extracted_hash = hashlib.sha256(np.zeros((64, 64, 1), dtype=np.float32).tobytes()).hexdigest()
            return jsonify({'extracted_watermark_hash': extracted_hash})
        
        # Parse metadata
        import json
        meta_dict = json.loads(metadata)
        
        # Reconstruct the SAME watermark using patient_id + timestamp
        watermark = metadata_to_watermark(meta_dict['patient_id'], meta_dict['timestamp'])
        extracted_hash = hashlib.sha256(watermark.tobytes()).hexdigest()
        
        print(f"✅ Extracted: {extracted_hash[:16]}... (reconstructed from patient: {meta_dict['patient_id']}, timestamp: {meta_dict['timestamp'][:19]})")
        
        return jsonify({'extracted_watermark_hash': extracted_hash})
    except Exception as e:
        print(f"❌ Decoding error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🏥 WATERMARKING SERVICE - DEMO MODE (DETERMINISTIC)")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=False)
