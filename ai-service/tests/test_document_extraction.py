from io import BytesIO

import fitz
from fastapi.testclient import TestClient
from PIL import Image

import app.document.routes as document_routes
from app.main import app

client = TestClient(app)


def create_test_pdf(text: str | None = None) -> bytes:
    document = fitz.open()
    page = document.new_page()

    if text:
        page.insert_text((72, 72), text)

    content = document.tobytes()
    document.close()
    return content


def create_test_image() -> bytes:
    image = Image.new("RGB", (500, 200), "white")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_extract_text_from_pdf():
    pdf = create_test_pdf("LearnLite PDF extraction test")

    response = client.post(
        "/api/v1/documents/extract",
        files={"file": ("notes.pdf", pdf, "application/pdf")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["extraction_status"] == "success"
    assert data["total_pages"] == 1
    assert data["extracted_pages"] == 1
    assert "LearnLite PDF extraction test" in data["pages"][0]["text"]


def test_extract_text_from_image(monkeypatch):
    async def fake_ocr(image_bytes, content_type="image/png"):
        return "Machine Learning is a branch of Artificial Intelligence."

    monkeypatch.setattr(
        document_routes,
        "extract_text_from_image",
        fake_ocr,
    )

    response = client.post(
        "/api/v1/documents/extract",
        files={
            "file": (
                "lecture.png",
                create_test_image(),
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["extraction_status"] == "success"
    assert data["total_pages"] == 1
    assert "Machine Learning" in data["pages"][0]["text"]


def test_scanned_pdf_uses_ocr(monkeypatch):
    async def fake_ocr(image_bytes, content_type="image/png"):
        return "This is text extracted from a scanned page."

    monkeypatch.setattr(
        document_routes,
        "extract_text_from_image",
        fake_ocr,
    )

    response = client.post(
        "/api/v1/documents/extract",
        files={
            "file": (
                "scanned-notes.pdf",
                create_test_pdf(),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["extraction_status"] == "success"
    assert data["extracted_pages"] == 1
    assert "scanned page" in data["pages"][0]["text"]


def test_reject_unsupported_file_type():
    response = client.post(
        "/api/v1/documents/extract",
        files={"file": ("notes.docx", b"sample", "application/octet-stream")},
    )

    assert response.status_code == 415
