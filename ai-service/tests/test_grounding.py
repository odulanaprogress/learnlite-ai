import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.generation.grounding import (
    build_grounding_items,
    normalize_evidence,
    validate_semantic_grounding,
)
from app.schemas.study_pack import (
    StudyPackRequest,
    StudyPackResponse,
)


SOURCE = (
    "Photosynthesis is the process by which green plants use light energy "
    "to convert carbon dioxide and water into glucose and oxygen."
)


def make_request():
    return StudyPackRequest(
        filename="biology.pdf",
        pages=[{"page_number": 1, "text": SOURCE}],
        difficulty="beginner",
        flashcard_count=5,
        quiz_count=3,
    )


def make_pack():
    return StudyPackResponse(
        filename="biology.pdf",
        difficulty="beginner",
        summary="Green plants use light energy to convert carbon dioxide and water into glucose and oxygen.",
        key_concepts=[
            {
                "term": "Photosynthesis",
                "definition": "The process by which green plants use light energy to make glucose from carbon dioxide and water.",
            }
        ],
        flashcards=[
            {
                "question": "What do green plants use light energy to produce?",
                "answer": "Glucose and oxygen.",
            }
        ],
        quiz=[
            {
                "question": "Which substances do green plants convert during photosynthesis?",
                "options": [
                    "Carbon dioxide and water",
                    "Oxygen and glucose",
                    "Nitrogen and oxygen",
                    "Protein and minerals",
                ],
                "correct_answer_index": 0,
                "explanation": "Photosynthesis converts carbon dioxide and water into glucose and oxygen.",
            }
        ],
    )


def supported_results():
    return [
        {
            "id": "summary",
            "verdict": "supported",
            "evidence": "green plants use light energy to convert carbon dioxide and water into glucose and oxygen",
        },
        {
            "id": "concept_0",
            "verdict": "supported",
            "evidence": "green plants use light energy to convert carbon dioxide and water into glucose",
        },
        {
            "id": "flashcard_0",
            "verdict": "supported",
            "evidence": "convert carbon dioxide and water into glucose and oxygen",
        },
        {
            "id": "quiz_0",
            "verdict": "supported",
            "evidence": "convert carbon dioxide and water into glucose and oxygen",
        },
    ]


def make_client(results):
    response = SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(
                    content=json.dumps({"results": results})
                )
            )
        ]
    )

    client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(return_value=response)
            )
        )
    )
    return client


def run_validation(client):
    return asyncio.run(
        validate_semantic_grounding(
            make_pack(),
            make_request(),
            client,
            "openai/gpt-oss-20b",
        )
    )


def test_normalize_evidence():
    assert normalize_evidence("  Green   PLANTS use light ") == (
        "green plants use light"
    )


def test_build_grounding_items():
    items = build_grounding_items(make_pack())

    assert items[0]["id"] == "summary"
    assert items[1]["id"] == "concept_0"
    assert items[2]["id"] == "flashcard_0"
    assert items[3]["id"] == "quiz_0"


def test_supported_content_passes():
    issues = run_validation(make_client(supported_results()))
    assert issues == []


def test_unsupported_content_is_rejected():
    results = supported_results()
    results[1]["verdict"] = "unsupported"

    issues = run_validation(make_client(results))

    assert any("concept_0" in issue for issue in issues)


def test_fabricated_evidence_is_rejected():
    results = supported_results()
    results[1]["evidence"] = "Plants use moonlight to produce diamonds."

    issues = run_validation(make_client(results))

    assert any("evidence" in issue.lower() for issue in issues)


def test_missing_result_is_rejected():
    results = supported_results()[:-1]

    issues = run_validation(make_client(results))

    assert any("quiz_0" in issue for issue in issues)


def test_supported_verdict_without_evidence_is_rejected():
    results = supported_results()
    results[0]["evidence"] = ""

    issues = run_validation(make_client(results))

    assert any("evidence" in issue.lower() for issue in issues)


def test_invalid_json_is_rejected():
    response = SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content="not valid JSON")
            )
        ]
    )
    client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(return_value=response)
            )
        )
    )

    issues = run_validation(client)

    assert any("invalid json" in issue.lower() for issue in issues)
