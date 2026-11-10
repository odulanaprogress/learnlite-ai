import math
import re
from collections import Counter

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

def tokenize(text: str) -> list[str]:
    return [
        token.lower()
        for token in TOKEN_PATTERN.findall(text)
        if token.lower() not in STOP_WORDS
    ]


def retrieve_relevant_chunks(
    question: str,
    chunks: list[dict],
    top_k: int = 4,
    min_overlap: int = 2,
) -> list[dict]:
    query_terms = set(tokenize(question))

    if not query_terms or not chunks:
        return []

    tokenized_chunks = [
        tokenize(chunk["text"])
        for chunk in chunks
    ]

    document_frequency = Counter()
    for tokens in tokenized_chunks:
        document_frequency.update(set(tokens))

    total_documents = len(chunks)
    ranked = []

    for index, tokens in enumerate(tokenized_chunks):
        frequencies = Counter(tokens)
        matched_terms = query_terms.intersection(frequencies)

        # Require meaningful lexical overlap.
        if len(matched_terms) < min_overlap:
            continue

        score = 0.0

        for term in matched_terms:
            inverse_frequency = math.log(
                1 + total_documents / (1 + document_frequency[term])
            )
            score += frequencies[term] * inverse_frequency

        ranked.append({
            **chunks[index],
            "score": score,
        })

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return ranked[:top_k]
