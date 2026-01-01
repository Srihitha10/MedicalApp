import tensorflow as tf
from tensorflow import keras

# Load your trained model (in Keras 3.x environment where you trained it)
model = keras.models.load_model('watermark_model_83acc_final.keras')

# Re-save as .h5 format (compatible with TensorFlow 2.10)
model.save('watermark_cnn_83acc.h5')
print("✅ Model converted and saved as watermark_cnn_83acc.h5")
