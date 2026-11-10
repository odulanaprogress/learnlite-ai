def chunk_pages(
    pages: list[dict],
    chunk_size: int = 1200,
    overlap: int = 200,
) -> list[dict]:
    """Split extracted pages into overlapping chunks, preserving page numbers."""
    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("Invalid chunk size or overlap.")

    chunks = []

    for page in pages:
        text = str(page.get("text", "")).strip()
        page_number = page.get("page_number")

        if not text:
            continue

        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "page_number": page_number,
                    "text": chunk_text,
                })

            if end == len(text):
                break

            start = end - overlap

    return chunks
