from pydantic import BaseModel


class ExtractedPage(BaseModel):
    page_number: int
    text: str


class DocumentExtractionResponse(BaseModel):
    filename: str
    total_pages: int
    extracted_pages: int
    total_characters: int
    extraction_status: str
    pages: list[ExtractedPage]
