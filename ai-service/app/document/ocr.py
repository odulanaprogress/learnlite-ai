import base64
from io import BytesIO

from groq import AsyncGroq
from PIL import Image

from app.config import get_settings


async def extract_text_from_image(
    image_bytes: bytes,
    content_type: str = "image/png",
) -> str:
    """Extract visible text from an image using Groq vision."""
    settings = get_settings()

    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    # Validate and normalize the image before sending it.
    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image.verify()

        with Image.open(BytesIO(image_bytes)) as image:
            image = image.convert("RGB")
            image.thumbnail((1800, 1800))

            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=85)
            normalized_bytes = buffer.getvalue()

    except Exception as exc:
        raise ValueError("The uploaded image is invalid or unreadable.") from exc

    encoded_image = base64.b64encode(normalized_bytes).decode("utf-8")

    client = AsyncGroq(
        api_key=settings.groq_api_key,
        timeout=60.0,
    )

    try:
        response = await client.chat.completions.create(
            model=settings.groq_vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract all readable text from this image. "
                                "Preserve the original wording, numbers, "
                                "headings, and paragraph order. "
                                "Do not summarize, explain, or invent text. "
                                "Return only the extracted text. "
                                "If no readable text exists, return an empty string."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    f"data:image/jpeg;base64,{encoded_image}"
                                )
                            },
                        },
                    ],
                }
            ],
            max_tokens=3000,
        )

        return response.choices[0].message.content or ""

    finally:
        await client.close()
