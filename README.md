# LearnLite 📚
### AI-Powered Learning Assistant

**Making learning more accessible, interactive, and personalized through Artificial Intelligence.**

[Live Demo](https://learnlite-ai-flax.vercel.app/) ·

---

## 1. About the Project

LearnLite is an AI-powered learning platform developed for the **NextGen AI Hackathon 2026**, under the challenge of reimagining how students learn, work and grow.

The project addresses the difficulties students face when accessing and understanding educational materials, particularly in environments where internet connectivity is unreliable, learning resources are difficult to access, and students need more interactive ways to study.

LearnLite transforms lecture materials into structured, interactive learning resources using Generative AI and computer vision.

Our goal is to make studying more efficient by helping students understand, revise and interact with their learning materials.

## 2. The Problem

Many students face challenges that affect their learning experience:

- Unreliable or expensive internet connectivity.
- Difficulty understanding lengthy lecture notes and textbooks.
- Limited access to personalized academic assistance.
- Time-consuming manual preparation of revision materials.
- Difficulty identifying and revisiting important concepts in course materials.

Traditional study methods do not always provide the flexibility and personalized support students need.

## 3. Our Solution

LearnLite provides an AI-assisted learning environment that transforms uploaded educational materials into useful study resources.

Students can use LearnLite to:

- **Extract learning materials:** Process PDF documents and image-based learning materials.
- **Generate summaries:** Convert lengthy lecture materials into concise summaries.
- **Identify key concepts:** Highlight important topics and explanations.
- **Create flashcards:** Generate revision cards for active recall.
- **Generate quizzes:** Produce multiple-choice questions for self-assessment.
- **Ask an AI tutor:** Ask questions about uploaded materials and receive context-grounded explanations.
- **Continue conversations:** Ask follow-up questions and request simpler explanations.

## 4. Key Features

| Feature | Description |
|---|---|
| Document extraction | Extracts text from uploaded PDF documents. |
| Image-based extraction | Uses computer vision for scanned and image-based learning materials. |
| AI summaries | Generates concise summaries of lecture materials. |
| Key concepts | Identifies important concepts and explanations. |
| Flashcards | Creates revision flashcards from uploaded content. |
| Practice quizzes | Generates multiple-choice questions. |
| AI tutor | Answers questions using uploaded learning materials. |
| Evidence grounding | Checks generated claims against source-document passages. |
| Conversational learning | Supports conversation history and follow-up questions. |

## 5. AI Integration

LearnLite combines Generative AI, computer vision, document processing and evidence validation.

### Study Material Generation

Extracted document content is sent to GPT-OSS-20B through Groq.

The model generates structured learning resources, including:
- Summaries.
- Key concepts.
- Flashcards.
- Multiple-choice questions.

Pydantic models validate request and response structures to maintain consistent data formats.

### Evidence-Grounded AI Tutoring

The AI tutor uses content from students' uploaded documents to answer questions.

The system:
1. Organizes document content into passages.
2. Retrieves relevant passages using lightweight lexical similarity.
3. Supplies relevant context to the language model.
4. Generates an answer using the retrieved material.
5. Returns relevant source information and page references.

A separate semantic-grounding process evaluates generated claims against the original document passages.

The verifier identifies supporting passages using evidence IDs. The application then validates those IDs against the actual evidence set to reject invalid or fabricated references.

When the available material does not provide sufficient information, the tutor can indicate that the question cannot be answered from the uploaded content.

## 6. System Architecture

LearnLite follows a modular, three-layer architecture.

```text
                 STUDENT
                    |
                    v
          +--------------------+
          |  LEARNLITE FRONTEND|
          |                    |
          | Uploads            |
          | Summaries          |
          | Flashcards         |
          | Quizzes            |
          | AI Tutor           |
          +--------------------+
                    |
                    v
          +--------------------+
          |   MAIN BACKEND     |
          |                    |
          | Application APIs   |
          | Request Handling   |
          | Service Integration|
          +--------------------+
                    |
                    v
          +--------------------+
          |  LEARNLITE AI      |
          |  SERVICE (FastAPI) |
          |                    |
          | PDF Extraction     |
          | Vision Processing  |
          | Study Generation   |
          | AI Tutoring         |
          | Evidence Grounding |
          +--------------------+
                    |
                    v
          +--------------------+
          |     GROQ API       |
          |                    |
          | GPT-OSS-20B        |
          | Qwen Vision        |
          +--------------------+
```

### Component Responsibilities

- **Frontend:** Provides the student-facing learning experience.
- **Main backend:** Coordinates application requests and communicates with the AI service.
- **AI service:** Handles document processing, AI generation, tutoring and evidence verification.
- **Groq API:** Provides remote inference for the configured language and vision models.

This architecture allows the AI service to evolve independently while maintaining a clear integration boundary with the main backend.

## 7. Technology Stack

| Category | Technologies |
|---|---|
| Programming language | Python |
| AI backend | FastAPI |
| Text-generation model | Llama |
| Vision model | Llama  |
| Model inference | Groq API |
| PDF processing | PyMuPDF |
| Data validation | Pydantic |
| HTTP communication | HTTPX |
| Testing | Pytest |
| AI service deployment | Render |
| Frontend deployment | Vercel |


## 8. Hackathon

LearnLite was developed for the **NextGen AI Hackathon 2026**, organized by **Wale Lab and Wale University**.

Our project explores how AI can help make learning more accessible, interactive and adaptable to the realities students face.

## 9. Team

LearnLite was developed collaboratively by our hackathon team.

Adediran Abiodun
------------------
Progress Odulana
------------------
Achesomie Yifieyeh
-------------------
Hikmah Balogun
------------------

The project combines frontend engineering, backend development and applied AI engineering to deliver an integrated learning platform.

---

**LearnLite — Learn smarter. Understand better. Grow further.**
