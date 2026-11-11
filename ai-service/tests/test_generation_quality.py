from app.generation.quality import (
    is_duplicate,
    normalize_text,
    validate_study_pack,
)
from app.schemas.study_pack import (
    KeyConcept,
    StudyPackRequest,
    StudyPackResponse,
)


def valid_pack():
    return StudyPackResponse(
        filename="lecture.pdf",
        difficulty="beginner",
        summary="Machine learning enables systems to learn patterns from data.",
        key_concepts=[
            {
                "term": "Machine Learning",
                "definition": "A branch of artificial intelligence.",
            },
            {
                "term": "Supervised Learning",
                "definition": "Learning from labelled data.",
            },
        ],
        flashcards=[
            {
                "question": "What is machine learning?",
                "answer": "A branch of artificial intelligence.",
            },
            {
                "question": "What data does supervised learning use?",
                "answer": "Labelled data.",
            },
            {
                "question": "What does unsupervised learning discover?",
                "answer": "Patterns in unlabelled data.",
            },
            {
                "question": "What is artificial intelligence?",
                "answer": "The field that includes machine learning.",
            },
            {
                "question": "What does machine learning enable?",
                "answer": "Systems learn patterns from data.",
            },
        ],
        quiz=[
            {
                "question": "Machine learning is a branch of which field?",
                "options": [
                    "Artificial Intelligence",
                    "Chemistry",
                    "Geography",
                    "History",
                ],
                "correct_answer_index": 0,
                "explanation": "Machine learning is a branch of Artificial Intelligence.",
            },
            {
                "question": "Which learning method uses labelled data?",
                "options": [
                    "Supervised learning",
                    "Unsupervised learning",
                    "Reinforcement learning",
                    "Random learning",
                ],
                "correct_answer_index": 0,
                "explanation": "Supervised learning uses labelled data.",
            },
            {
                "question": "What does unsupervised learning discover?",
                "options": [
                    "Patterns in unlabelled data",
                    "Only labelled answers",
                    "Financial transactions",
                    "Chemical compounds",
                ],
                "correct_answer_index": 0,
                "explanation": "Unsupervised learning discovers patterns in unlabelled data.",
            },
        ],
    )


def valid_request():
    return StudyPackRequest(
        filename="lecture.pdf",
        pages=[
            {
                "page_number": 1,
                "text": (
                    "Machine learning is a branch of Artificial Intelligence. "
                    "Supervised learning uses labelled data. "
                    "Unsupervised learning discovers patterns in unlabelled data."
                ),
            }
        ],
        difficulty="beginner",
        flashcard_count=5,
        quiz_count=3,
    )


def test_normalize_text_removes_punctuation_and_common_words():
    assert normalize_text("What is Machine Learning?") == "machine learning"


def test_detects_exact_and_near_duplicates():
    existing = ["What is machine learning?"]

    assert is_duplicate("What is machine learning?", existing)
    assert is_duplicate("What is machine-learning?", existing)


def test_allows_distinct_questions():
    existing = ["What is machine learning?"]

    assert not is_duplicate(
        "Which method uses labelled data?",
        existing,
    )


def test_valid_study_pack_passes_quality_checks():
    issues = validate_study_pack(valid_pack(), valid_request())

    assert issues == []


def test_duplicate_flashcards_are_flagged():
    pack = valid_pack()
    pack.flashcards[1].question = "What is machine learning?"

    issues = validate_study_pack(pack, valid_request())

    assert any("Duplicate or near-duplicate flashcard" in issue for issue in issues)


def test_duplicate_quiz_questions_are_flagged():
    pack = valid_pack()
    pack.quiz[1].question = pack.quiz[0].question

    issues = validate_study_pack(pack, valid_request())

    assert any("Duplicate or near-duplicate quiz question" in issue for issue in issues)


def test_duplicate_quiz_options_are_flagged():
    pack = valid_pack()
    pack.quiz[0].options[1] = pack.quiz[0].options[0]

    issues = validate_study_pack(pack, valid_request())

    assert any("duplicate options" in issue for issue in issues)


def test_paraphrased_content_is_not_rejected_by_lexical_checks():
    pack = valid_pack()
    pack.key_concepts[0].definition = (
        "Systems identify patterns in examples and improve their performance."
    )

    issues = validate_study_pack(pack, valid_request())

    assert not any("word overlap" in issue for issue in issues)

def test_supervised_and_unsupervised_learning_are_distinct_concepts():
    existing = ["Supervised Learning"]

    assert not is_duplicate(
        "Unsupervised Learning",
        existing,
        exact_only=True,
    )


def test_identical_key_concept_terms_are_flagged():
    pack = valid_pack()
    pack.key_concepts.append(
        KeyConcept(
            term="Machine Learning",
            definition="Systems learn patterns from data.",
        )
    )

    issues = validate_study_pack(pack, valid_request())

    assert any(
        "Duplicate key concept: Machine Learning" in issue
        for issue in issues
    )


def test_supervised_and_unsupervised_concepts_pass_validation():
    pack = valid_pack()
    pack.key_concepts.append(
        KeyConcept(
            term="Unsupervised Learning",
            definition="Learning patterns from unlabelled data.",
        )
    )

    issues = validate_study_pack(pack, valid_request())

    assert not any(
        "Duplicate key concept" in issue
        for issue in issues
    )
