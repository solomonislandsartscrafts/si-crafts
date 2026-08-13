"""
Cloudflare R2 storage utility.
Uploads files to an R2 bucket via the S3-compatible API (using boto3).
"""

import os
import uuid
from io import BytesIO

import boto3
from botocore.config import Config
from PIL import Image


# R2 configuration from environment variables
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "si-crafts-media")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "")  # e.g. https://media.si-crafts.isaactekulu.workers.dev


def is_r2_configured() -> bool:
    """Return True if all required R2 env vars are set."""
    return bool(R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_PUBLIC_URL)


def get_r2_client():
    """Create and return a boto3 S3 client configured for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def convert_to_webp(file_data: bytes, quality: int = 80) -> bytes:
    """Convert any image (JPEG, PNG, WebP) to optimized WebP using Pillow."""
    img = Image.open(BytesIO(file_data))

    # Convert RGBA to RGB if needed (WebP supports both, but smaller as RGB for photos)
    if img.mode == "RGBA":
        # Keep alpha channel — WebP supports it
        pass
    elif img.mode != "RGB":
        img = img.convert("RGB")

    output = BytesIO()
    img.save(output, format="WEBP", quality=quality, optimize=True)
    return output.getvalue()


def upload_to_r2(file_data: bytes, content_type: str = "image/webp", folder: str = "uploads") -> str:
    """
    Upload image bytes to R2 and return the public URL.
    Converts to WebP if not already WebP.
    """
    # Convert to WebP if needed
    if content_type != "image/webp":
        file_data = convert_to_webp(file_data)
    else:
        # Even if already WebP, re-compress to ensure consistent quality/size
        file_data = convert_to_webp(file_data)

    filename = f"{uuid.uuid4()}.webp"
    key = f"{folder}/{filename}"

    client = get_r2_client()
    client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=key,
        Body=file_data,
        ContentType="image/webp",
    )

    # Return the public URL
    public_url = R2_PUBLIC_URL.rstrip("/")
    return f"{public_url}/{key}"
