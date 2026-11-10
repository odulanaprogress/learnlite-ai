from typing import Literal

from pydantic import BaseModel, Field, field_validator


class KeyConcept(BaseModel):
    term: str
    definition: str


class Flashcard(BaseModel):
    question: str
    answer: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer_index: int = Field(ge=0, le=3)
    explanation: str


class StudyPackRequest(BaseModel):
    filename: str = "lecture-notes"
    pages: list[dict] = Field(min_length=1)
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    flashcard_count: int = Field(default=8, ge=5, le=15)
    quiz_count: int = Field(default=5, ge=3, le=10)

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


class StudyPackResponse(BaseModel):
    filename: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    summary: str
    key_concepts: list[KeyConcept]
    flashcards: list[Flashcard]
    quiz: list[QuizQuestion]
