import re
from difflib import SequenceMatcher

from app.schemas.study_pack import StudyPackRequest, StudyPackResponse


TOKEN_PATTERN = re.compile(r"\b[a-zA-Z0-9]{2,}\b")

STOP_WORDS = {
    "the", "and", "for", "are", "was", "were", "with",
    "that", "this", "from", "what", "which", "when",
    "where", "who", "how", "why", "does", "did", "has",
    "have", "had", "can", "could", "would", "should",
    "about", "into", "their", "there", "them", "then",
    "than", "you", "your", "its", "our", "is", "of",
    "in", "to", "a", "an", "on", "it", "be", "as",
}


def normalize_text(value: str) -> str:
    return " ".join(
        token.lower()
        for token in TOKEN_PATTERN.findall(value)
        if token.lower() not in STOP_WORDS
    )


def is_duplicate(
    candidate: str,
    existing: list[str],
    threshold: float = 0.88,
) -> bool:
    normalized = normalize_text(candidate)

    if not normalized:
        return True

    for previous in existing:
        previous_normalized = normalize_text(previous)

        if normalized == previous_normalized:
            return True

        similarity = SequenceMatcher(
            None,
            normalized,
            previous_normalized,
        ).ratio()

        if similarity >= threshold:
            return True

    return False


def validate_study_pack(
    pack: StudyPackResponse,
    request: StudyPackRequest,
) -> list[str]:
    """Validate structure, completeness, counts, and duplicate content."""
    issues: list[str] = []

    if len(pack.flashcards) != request.flashcard_count:
        issues.append(
            f"Expected {request.flashcard_count} flashcards; "
            f"received {len(pack.flashcards)}."
        )

    if len(pack.quiz) != request.quiz_count:
        issues.append(
            f"Expected {request.quiz_count} quiz questions; "
            f"received {len(pack.quiz)}."
        )

    if not pack.summary.strip():
        issues.append("The summary is empty.")

    concept_terms: list[str] = []

    for index, concept in enumerate(pack.key_concepts, start=1):
        term = concept.term.strip()
        definition = concept.definition.strip()

        if not term or not definition:
            issues.append(f"Key concept {index} is incomplete.")
            continue

        if is_duplicate(term, concept_terms):
            issues.append(f"Duplicate key concept: {term}")

        concept_terms.append(term)

    flashcard_questions: list[str] = []

    for index, card in enumerate(pack.flashcards, start=1):
        question = card.question.strip()
        answer = card.answer.strip()

        if len(question) < 8 or len(answer) < 3:
            issues.append(f"Flashcard {index} is incomplete.")
            continue

        if is_duplicate(question, flashcard_questions):
            issues.append(
                f"Duplicate or near-duplicate flashcard question: {question}"
            )

        flashcard_questions.append(question)

    quiz_questions: list[str] = []

    for index, question in enumerate(pack.quiz, start=1):
        prompt = question.question.strip()
        options = [option.strip() for option in question.options]

        if len(prompt) < 10 or not question.explanation.strip():
            issues.append(f"Quiz question {index} is incomplete.")

        if is_duplicate(prompt, quiz_questions):
            issues.append(
                f"Duplicate or near-duplicate quiz question: {prompt}"
            )

        quiz_questions.append(prompt)

        normalized_options = [
            normalize_text(option)
            for option in options
        ]

        if len(set(normalized_options)) != 4:
            issues.append(
                f"Quiz question {index} contains duplicate options."
            )

    return issues
