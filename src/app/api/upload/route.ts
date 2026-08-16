import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// R2 configuration (same env vars as the Django backend)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'si-crafts-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_PUBLIC_URL);
}

/**
 * Upload bytes to Cloudflare R2 via the S3-compatible API using AWS Signature V4.
 * Returns the public URL of the uploaded file.
 */
async function uploadToR2(data: Uint8Array, contentType: string): Promise<string> {
  const id = crypto.randomUUID();
  const filename = `${id}.webp`;
  const key = `uploads/${filename}`;
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${R2_BUCKET_NAME}/${key}`;

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const region = 'auto';
  const service = 's3';

  // Web Crypto-based HMAC-SHA256 and SHA-256
  const encoder = new TextEncoder();

  async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key as ArrayBuffer,
      { name: 'HMAC', hash: { name: 'SHA-256' } } as HmacImportParams,
      false,
      ['sign']
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  }

  async function sha256Hex(data: Uint8Array | string): Promise<string> {
    const input = typeof data === 'string' ? encoder.encode(data) : data;
    const hash = await crypto.subtle.digest('SHA-256', input as unknown as ArrayBuffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const payloadHash = await sha256Hex(data);
  const headers: Record<string, string> = {
    'host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'content-type': contentType,
    'content-length': String(data.length),
  };

  // Canonical request
  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeadersStr = signedHeaderKeys.join(';');
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const canonicalRequest = [
    'PUT',
    `/${R2_BUCKET_NAME}/${key}`,
    '',
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join('\n');

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  // Signing key
  const kDate = await hmacSha256(encoder.encode(`AWS4${R2_SECRET_ACCESS_KEY}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signatureBuf = await hmacSha256(kSigning, stringToSign);
  const signature = bufToHex(signatureBuf);

  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      'Authorization': authorization,
    },
    body: data as unknown as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }

  const publicUrl = R2_PUBLIC_URL.replace(/\/$/, '');
  return `${publicUrl}/${key}`;
}

/**
 * Local filesystem fallback — only works in Node.js environments (dev mode).
 */
async function saveLocally(data: Uint8Array, fileType: string): Promise<string> {
  // Dynamic import to avoid crashing on edge runtime
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');

  const ext = fileType === 'image/png' ? 'png' : fileType === 'image/jpeg' ? 'jpg' : 'webp';
  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), data);
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    // Require admin session token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    // Max 5MB after compression
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Compressed file exceeds 5 MB' }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());

    // Upload to R2 if configured
    if (isR2Configured()) {
      const url = await uploadToR2(data, file.type);
      return NextResponse.json({ url });
    }

    // Fallback: save locally (only works in Node.js dev, not on edge)
    try {
      const url = await saveLocally(data, file.type);
      return NextResponse.json({ url });
    } catch {
      return NextResponse.json(
        { error: 'Upload storage not configured. Please set R2 environment variables.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[upload] Error:', err);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
