import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
 * Upload a buffer to Cloudflare R2 via the S3-compatible API.
 * Returns the public URL of the uploaded file.
 */
async function uploadToR2(buffer: Buffer, contentType: string): Promise<string> {
  const filename = `${crypto.randomUUID()}.webp`;
  const key = `uploads/${filename}`;
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${R2_BUCKET_NAME}/${key}`;

  // Build S3v4 signature manually for a simple PUT
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const region = 'auto';
  const service = 's3';

  const { createHmac, createHash } = await import('crypto');

  function hmacSha256(key: Buffer | string, data: string): Buffer {
    return createHmac('sha256', key).update(data).digest();
  }

  function sha256(data: Buffer | string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  const payloadHash = sha256(buffer);
  const headers: Record<string, string> = {
    'host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'content-type': contentType,
    'content-length': String(buffer.length),
  };

  // Canonical request
  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeadersStr = signedHeaderKeys.join(';');
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const canonicalRequest = [
    'PUT',
    `/${R2_BUCKET_NAME}/${key}`,
    '', // query string
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join('\n');

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  // Signing key
  const kDate = hmacSha256(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');

  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      'Authorization': authorization,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${text}`);
  }

  const publicUrl = R2_PUBLIC_URL.replace(/\/$/, '');
  return `${publicUrl}/${key}`;
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

    // Validate type — only safe raster image formats
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    // Max 5MB after compression
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Compressed file exceeds 5 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2 if configured
    if (isR2Configured()) {
      try {
        const url = await uploadToR2(buffer, file.type);
        return NextResponse.json({ url });
      } catch (err) {
        console.error('[upload] R2 upload failed, falling back to local:', err);
      }
    }

    // Fallback: save locally to public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp';
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.${ext}`;

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload] Error:', err);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
