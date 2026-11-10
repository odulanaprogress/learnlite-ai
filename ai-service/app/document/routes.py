from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import get_settings
from app.document.ocr import extract_text_from_image
from app.document.pdf_processor import (
    extract_pdf_text,
    render_pdf_page,
)
from app.schemas.document import DocumentExtractionResponse

router = APIRouter(
    prefix="/api/v1/documents",
    tags=["Documents"],
)

SUPPORTED_IMAGE_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


@router.post(
    "/extract",
    response_model=DocumentExtractionResponse,
)
async def extract_document(file: UploadFile = File(...)):
    settings = get_settings()
    filename = file.filename or "document"

    max_size = settings.max_upload_size_mb * 1024 * 1024
    content = await file.read(max_size + 1)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_upload_size_mb} MB limit.",
        )

    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    pages = []

    if extension == ".pdf":
        try:
            total_pages, pages = extract_pdf_text(content)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not read this PDF. It may be corrupted or invalid.",
            ) from exc

        # OCR only pages without selectable text.
        for page in pages:
            if page["text"].strip():
                continue

            try:
                page_image = render_pdf_page(
                    content,
                    page["page_number"] - 1,
                )
                page["text"] = await extract_text_from_image(
                    page_image,
                    "image/png",
                )
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(exc),
                ) from exc
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        f"OCR failed on PDF page {page['page_number']}. "
                        "Please retry the request."
                    ),
                ) from exc

    elif extension in SUPPORTED_IMAGE_TYPES:
        total_pages = 1

        try:
            image_text = await extract_text_from_image(
                content,
                SUPPORTED_IMAGE_TYPES[extension],
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Image OCR failed. Please retry the request.",
            ) from exc

        pages = [{
            "page_number": 1,
            "text": image_text.strip(),
        }]

    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Supported formats: PDF, PNG, JPG and JPEG.",
        )

    extracted_pages = [
        page for page in pages if page["text"].strip()
    ]

    total_characters = sum(
        len(page["text"]) for page in extracted_pages
    )

    if total_characters == 0:
        extraction_status = "no_text_found"
    elif len(extracted_pages) < total_pages:
        extraction_status = "partial"
    else:
        extraction_status = "success"

    return DocumentExtractionResponse(
        filename=filename,
        total_pages=total_pages,
        extracted_pages=len(extracted_pages),
        total_characters=total_characters,
        extraction_status=extraction_status,
        pages=pages,
    )
