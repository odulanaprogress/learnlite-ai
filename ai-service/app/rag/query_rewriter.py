from groq import AsyncGroq

from app.schemas.tutor import TutorRequest


SYSTEM_PROMPT = """
You rewrite student follow-up questions into standalone search queries.

Rules:
- Use conversation history and the conversation summary only to resolve
  references and understand the student's intent.
- Do not answer the student's question.
- Do not add facts, explanations, or concepts not present in the conversation.
- Resolve references such as "it", "that", "the first one", and "the other one"
  when the context makes their meaning clear.
- Preserve the original intent and requested level of detail.
- If the question is already standalone, preserve its meaning.
- If a reference cannot be resolved confidently, do not guess.
- Return only the standalone question. No explanation, labels, or quotation marks.
"""


async def rewrite_question(
    client: AsyncGroq,
    model: str,
    request: TutorRequest,
) -> str:
    history_text = "\n".join(
        f"{message.role.upper()}: {message.content}"
        for message in request.history[-16:]
    )

    summary = request.conversation_summary or "No conversation summary."

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"CONVERSATION SUMMARY:\n{summary}\n\n"
                    f"RECENT CONVERSATION:\n{history_text or 'No previous messages.'}\n\n"
                    f"CURRENT QUESTION:\n{request.question}"
                ),
            },
        ],
        temperature=0,
        max_tokens=200,
    )

    rewritten = response.choices[0].message.content

    if not rewritten or not rewritten.strip():
        raise ValueError("The query rewriter returned an empty question.")

    return rewritten.strip()
