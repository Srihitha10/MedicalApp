/**
 * Encryption Service
 *
 * This service handles the encryption and decryption of medical data
 * using the Web Crypto API for client-side encryption operations.
 */

// Generate a random encryption key
const generateEncryptionKey = async () => {
  try {
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    // Export the key to raw bytes
    const rawKey = await window.crypto.subtle.exportKey("raw", key);

    // Convert to base64 for storage/transmission
    return arrayBufferToBase64(rawKey);
  } catch (error) {
    console.error("Error generating encryption key:", error);
    throw new Error("Failed to generate encryption key.");
  }
};

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Import a key from base64 string
const importEncryptionKey = async (keyBase64) => {
  try {
    const keyData = base64ToArrayBuffer(keyBase64);

    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // not extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error importing encryption key:", error);
    throw new Error("Failed to import encryption key.");
  }
};

// Encrypt data
const encryptData = async (data, keyBase64) => {
  try {
    // Import the encryption key
    const key = await importEncryptionKey(keyBase64);

    // Generate a random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Convert data to ArrayBuffer if it's not already
    let dataBuffer;
    if (data instanceof ArrayBuffer) {
      dataBuffer = data;
    } else if (typeof data === "string") {
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(data);
    } else if (data instanceof Blob) {
      dataBuffer = await data.arrayBuffer();
    } else {
      // For objects or other types, stringify and encode
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(JSON.stringify(data));
    }

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Return both the IV and encrypted data
    return {
      iv: arrayBufferToBase64(iv),
      encryptedData: arrayBufferToBase64(encryptedData),
      encryptionType: "AES-GCM",
    };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Failed to encrypt data.");
  }
};

// Decrypt data
const decryptData = async (encryptedPackage, keyBase64) => {
  try {
    // Import the encryption key
    const key = await importEncryptionKey(keyBase64);

    // Extract the IV and encrypted data
    const iv = base64ToArrayBuffer(encryptedPackage.iv);
    const encryptedData = base64ToArrayBuffer(encryptedPackage.encryptedData);

    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      encryptedData
    );

    // Convert the decrypted data back to its original format
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Failed to decrypt data.");
  }
};

// Hash data (useful for integrity checks)
const hashData = async (data) => {
  try {
    // Convert data to ArrayBuffer if it's not already
    let dataBuffer;
    if (data instanceof ArrayBuffer) {
      dataBuffer = data;
    } else if (typeof data === "string") {
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(data);
    } else if (data instanceof Blob) {
      dataBuffer = await data.arrayBuffer();
    } else {
      // For objects or other types, stringify and encode
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(JSON.stringify(data));
    }

    // Hash the data using SHA-256
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing data:", error);
    throw new Error("Failed to hash data.");
  }
};

// Generate a random key pair for asymmetric encryption (useful for secure key exchange)
const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    // Export the public key for sharing
    const publicKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey
    );

    // Export the private key for local storage
    const privateKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );

    return {
      publicKey: publicKeyJwk,
      privateKey: privateKeyJwk,
    };
  } catch (error) {
    console.error("Error generating key pair:", error);
    throw new Error("Failed to generate key pair.");
  }
};

export {
  generateEncryptionKey,
  encryptData,
  decryptData,
  hashData,
  generateKeyPair,
  arrayBufferToBase64,
  base64ToArrayBuffer,
};
