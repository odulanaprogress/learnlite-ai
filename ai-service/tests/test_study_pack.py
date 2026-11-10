from fastapi.testclient import TestClient

import app.generation.routes as study_routes
from app.main import app
from app.schemas.study_pack import StudyPackResponse

client = TestClient(app)


def sample_study_pack():
    return StudyPackResponse(
        filename="lecture.pdf",
        difficulty="beginner",
        summary="Machine learning is a branch of artificial intelligence.",
        key_concepts=[
            {
                "term": "Machine Learning",
                "definition": "A branch of artificial intelligence.",
            }
        ],
        flashcards=[
            {
                "question": "What is machine learning?",
                "answer": "A branch of artificial intelligence.",
            }
            for _ in range(8)
        ],
        quiz=[
            {
                "question": "Machine learning belongs to which field?",
                "options": [
                    "Artificial Intelligence",
                    "Chemistry",
                    "Geography",
                    "History",
                ],
                "correct_answer_index": 0,
                "explanation": "Machine learning is a branch of AI.",
            }
            for _ in range(5)
        ],
    )


def test_study_pack_generation_endpoint(monkeypatch):
    async def fake_generator(request):
        return sample_study_pack()

    monkeypatch.setattr(
        study_routes,
        "generate_study_pack",
        fake_generator,
    )

    response = client.post(
        "/api/v1/study/generate",
        json={
            "filename": "lecture.pdf",
            "pages": [
                {
                    "page_number": 1,
                    "text": "Machine learning is a branch of AI.",
                }
            ],
            "difficulty": "beginner",
            "flashcard_count": 8,
            "quiz_count": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["difficulty"] == "beginner"
    assert len(data["flashcards"]) == 8
    assert len(data["quiz"]) == 5
    assert data["quiz"][0]["correct_answer_index"] == 0


def test_study_pack_rejects_empty_document():
    response = client.post(
        "/api/v1/study/generate",
        json={
            "filename": "empty.pdf",
            "pages": [
                {"page_number": 1, "text": "   "}
            ],
        },
    )

    assert response.status_code == 422


def test_study_pack_rejects_invalid_quiz_count():
    response = client.post(
        "/api/v1/study/generate",
        json={
            "filename": "lecture.pdf",
            "pages": [
                {"page_number": 1, "text": "Some academic content."}
            ],
            "quiz_count": 50,
        },
    )

    assert response.status_code == 422
