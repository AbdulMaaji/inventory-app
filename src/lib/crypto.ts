
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export async function generateSalt(): Promise<string> {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return arrayBufferToBase64(array.buffer);
}

export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: base64ToArrayBuffer(salt),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true, // extractable so we can use it to wrap/unwrap? No, usage is encrypt/decrypt.
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
}

export async function generateDataKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(exported);
}

export async function importKey(keyStr: string): Promise<CryptoKey> {
    const keyBuffer = base64ToArrayBuffer(keyStr);
    return window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptData(data: any, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
    );

    // Combine IV and data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

export async function decryptData(encryptedString: string, key: CryptoKey): Promise<any> {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedString));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
}

// Encrypt the DEK with the KEK
export async function encryptDEK(dek: CryptoKey, kek: CryptoKey): Promise<string> {
    // Export DEK first
    const rawDek = await window.crypto.subtle.exportKey("raw", dek);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        kek,
        rawDek
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

// Decrypt the DEK with the KEK
export async function decryptDEK(encryptedDek: string, kek: CryptoKey): Promise<CryptoKey> {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedDek));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedRaw = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        kek,
        data
    );

    return window.crypto.subtle.importKey(
        "raw",
        decryptedRaw,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function hashPassword(password: string, salt: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const hashBuffer = await window.crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: base64ToArrayBuffer(salt),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    return arrayBufferToBase64(hashBuffer);
}
