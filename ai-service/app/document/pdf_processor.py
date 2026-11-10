import fitz


def extract_pdf_text(content: bytes) -> tuple[int, list[dict]]:
    """Extract selectable text from a PDF, preserving page numbers."""
    pages = []

    with fitz.open(stream=content, filetype="pdf") as document:
        total_pages = len(document)

        for index, page in enumerate(document):
            text = page.get_text("text").strip()

            pages.append({
                "page_number": index + 1,
                "text": text,
            })

    return total_pages, pages


def render_pdf_page(
    content: bytes,
    page_index: int,
    scale: float = 1.5,
) -> bytes:
    """Render one PDF page as PNG bytes for OCR."""
    with fitz.open(stream=content, filetype="pdf") as document:
        page = document.load_page(page_index)
        pixmap = page.get_pixmap(
            matrix=fitz.Matrix(scale, scale),
            alpha=False,
        )
        return pixmap.tobytes("png")
