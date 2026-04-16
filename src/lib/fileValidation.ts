/**
 * File validation helpers.
 *
 * MIME type reported by the browser cannot be trusted — an attacker can send
 * `image/jpeg` with any bytes inside. These helpers inspect the actual content
 * (magic bytes) and sanitize filenames.
 */

export type AllowedKind = 'jpg' | 'png' | 'webp' | 'heic' | 'pdf';

const SIGNATURES: Record<AllowedKind, (b: Uint8Array) => boolean> = {
    jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    png: (b) =>
        b[0] === 0x89 &&
        b[1] === 0x50 &&
        b[2] === 0x4e &&
        b[3] === 0x47 &&
        b[4] === 0x0d &&
        b[5] === 0x0a &&
        b[6] === 0x1a &&
        b[7] === 0x0a,
    webp: (b) =>
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
    heic: (b) =>
        b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
        (b[8] === 0x68 || b[8] === 0x6d), // 'heic' or 'mif1'/'heix'/'heim'...
    pdf: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
};

const MIME_TO_KIND: Record<string, AllowedKind> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heic',
    'application/pdf': 'pdf',
};

export function detectKind(buffer: Buffer, allowed: AllowedKind[]): AllowedKind | null {
    const view = new Uint8Array(buffer.buffer, buffer.byteOffset, Math.min(buffer.byteLength, 16));
    for (const kind of allowed) {
        if (SIGNATURES[kind](view)) return kind;
    }
    return null;
}

/**
 * Validates that the declared MIME type matches the actual file content.
 * Returns the canonical extension to use in the storage path, or null if invalid.
 */
export function validateFileContent(
    buffer: Buffer,
    declaredMime: string,
    allowed: AllowedKind[],
): AllowedKind | null {
    const declaredKind = MIME_TO_KIND[declaredMime];
    if (!declaredKind || !allowed.includes(declaredKind)) return null;

    const actualKind = detectKind(buffer, allowed);
    if (!actualKind) return null;

    // Declared must match actual to prevent content-type spoofing.
    return actualKind === declaredKind ? actualKind : null;
}

/**
 * Strips path traversal and unsafe characters from a user-supplied filename,
 * returning only the base name (no directory components).
 */
export function sanitizeFileName(name: string): string {
    const base = name.replace(/\\/g, '/').split('/').pop() || 'file';
    return base.replace(/[^\w.\- ]/g, '_').slice(0, 120);
}
