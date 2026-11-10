from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class TutorRequest(BaseModel):
    filename: str = "lecture-notes"
    pages: list[dict] = Field(min_length=1)
    question: str = Field(min_length=3, max_length=1000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=16)
    conversation_summary: str | None = Field(default=None, max_length=2000)

    @field_validator("pages")
    @classmethod
    def validate_pages(cls, pages):
        if not any(
            isinstance(page, dict) and str(page.get("text", "")).strip()
            for page in pages
        ):
            raise ValueError("At least one page must contain extracted text.")

        total_chars = sum(
            len(str(page.get("text", "")))
            for page in pages
            if isinstance(page, dict)
        )

        if total_chars > 40000:
            raise ValueError("Document text exceeds the 40,000-character limit.")

        return pages


class TutorSource(BaseModel):
    page_number: int
    excerpt: str


class TutorResponse(BaseModel):
    answer: str
    sources: list[TutorSource]
    insufficient_context: bool = False
