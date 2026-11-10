from fastapi.testclient import TestClient

import app.rag.routes as tutor_routes
from app.main import app
from app.rag.chunker import chunk_pages
from app.rag.retriever import retrieve_relevant_chunks
from app.schemas.tutor import TutorResponse

client = TestClient(app)


SAMPLE_PAGES = [
    {
        "page_number": 1,
        "text": (
            "Machine Learning is a branch of Artificial Intelligence. "
            "It enables computer systems to learn patterns from data "
            "and make predictions without explicit programming. "
            "Supervised learning uses labelled data."
        ),
    },
    {
        "page_number": 2,
        "text": (
            "Unsupervised learning discovers patterns in unlabelled data. "
            "Reinforcement learning involves an agent learning through "
            "rewards and penalties."
        ),
    },
]


def test_chunk_pages_preserves_page_numbers():
    chunks = chunk_pages(SAMPLE_PAGES, chunk_size=100, overlap=20)

    assert chunks
    assert all("page_number" in chunk for chunk in chunks)
    assert {chunk["page_number"] for chunk in chunks} == {1, 2}


def test_retriever_finds_relevant_passage():
    chunks = chunk_pages(SAMPLE_PAGES)

    results = retrieve_relevant_chunks(
        "What is supervised learning?",
        chunks,
    )

    assert results
    assert results[0]["page_number"] == 1


def test_retriever_returns_empty_for_unrelated_question():
    chunks = chunk_pages(SAMPLE_PAGES)

    results = retrieve_relevant_chunks(
        "What is the capital of France?",
        chunks,
    )

    assert results == []


def test_tutor_endpoint(monkeypatch):
    async def fake_answer(request):
        return TutorResponse(
            answer="Supervised learning uses labelled data.",
            sources=[
                {
                    "page_number": 1,
                    "excerpt": "Supervised learning uses labelled data.",
                }
            ],
            insufficient_context=False,
        )

    monkeypatch.setattr(
        tutor_routes,
        "answer_question",
        fake_answer,
    )

    response = client.post(
        "/api/v1/tutor/ask",
        json={
            "filename": "machine-learning-notes.pdf",
            "pages": SAMPLE_PAGES,
            "question": "What does supervised learning use?",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert "labelled data" in data["answer"]
    assert data["sources"][0]["page_number"] == 1
    assert data["insufficient_context"] is False


def test_tutor_rejects_empty_document():
    response = client.post(
        "/api/v1/tutor/ask",
        json={
            "filename": "empty.pdf",
            "pages": [{"page_number": 1, "text": " "}],
            "question": "What is machine learning?",
        },
    )

    assert response.status_code == 422


def test_tutor_rejects_short_question():
    response = client.post(
        "/api/v1/tutor/ask",
        json={
            "filename": "notes.pdf",
            "pages": SAMPLE_PAGES,
            "question": "AI",
        },
    )

    assert response.status_code == 422
