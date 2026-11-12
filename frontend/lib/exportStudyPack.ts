import type { StudyPack } from "./api";

/**
 * LearnLite Study Pack Local Exporter
 * Allows students to download self-contained study packs directly to their
 * device's local filesystem (as .txt, .md, or .json) for true zero-connection offline study.
 */

export function formatStudyPackAsText(pack: StudyPack): string {
  const divider = "=".repeat(65);
  const subDivider = "-".repeat(65);

  let output = `${divider}\n`;
  output += `LEARNLITE AI — OFFLINE STUDY PACK\n`;
  output += `Topic: ${pack.filename || "Lecture Notes"}\n`;
  output += `Generated: ${new Date(pack.createdAt || Date.now()).toLocaleString()}\n`;
  output += `Difficulty: ${(pack.difficulty || "intermediate").toUpperCase()}\n`;
  output += `${divider}\n\n`;

  // 1. Executive Summary
  output += `[ 1. EXECUTIVE SUMMARY ]\n${subDivider}\n`;
  output += `${pack.summary || "No summary available."}\n\n`;

  // 2. Key Concepts & Definitions
  if (pack.key_concepts && pack.key_concepts.length > 0) {
    output += `[ 2. KEY CONCEPTS & DEFINITIONS ]\n${subDivider}\n`;
    pack.key_concepts.forEach((concept, idx) => {
      output += `${idx + 1}. ${concept.term}\n   ${concept.definition}\n\n`;
    });
  }

  // 3. Active Recall Flashcards
  if (pack.flashcards && pack.flashcards.length > 0) {
    output += `[ 3. ACTIVE RECALL FLASHCARDS (${pack.flashcards.length} CARDS) ]\n${subDivider}\n`;
    pack.flashcards.forEach((card, idx) => {
      output += `Card #${idx + 1}\n`;
      output += `QUESTION: ${card.question}\n`;
      output += `ANSWER:   ${card.answer}\n`;
      if (card.category) output += `CATEGORY: ${card.category}\n`;
      output += `\n`;
    });
  }

  // 4. Practice Quiz
  if (pack.quiz && pack.quiz.length > 0) {
    output += `[ 4. PRACTICE EXAM QUESTIONS (${pack.quiz.length} QUESTIONS) ]\n${subDivider}\n`;
    pack.quiz.forEach((q, idx) => {
      output += `Question ${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        output += `   [${letter}] ${opt}\n`;
      });
      const correctLetter = String.fromCharCode(65 + q.correct_answer_index);
      output += `CORRECT ANSWER: [${correctLetter}] ${q.options[q.correct_answer_index] || ""}\n`;
      if (q.explanation) {
        output += `EXPLANATION:    ${q.explanation}\n`;
      }
      output += `\n`;
    });
  }

  output += `${divider}\n`;
  output += `Saved locally on your device for offline study.\n`;
  output += `LearnLite AI — Accessible Education Everywhere.\n`;
  output += `${divider}\n`;

  return output;
}

export function downloadStudyPackFile(
  pack: StudyPack,
  format: "txt" | "json" | "md" = "txt"
): void {
  if (typeof window === "undefined") return;

  const sanitizedName = (pack.filename || "Study-Pack")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .slice(0, 40);

  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === "json") {
    content = JSON.stringify(pack, null, 2);
    mimeType = "application/json;charset=utf-8";
    extension = "json";
  } else if (format === "md") {
    content = `# LearnLite Study Pack: ${pack.filename}\n\n` +
      `**Difficulty:** ${pack.difficulty} | **Saved:** ${new Date().toLocaleDateString()}\n\n` +
      `## 📖 Summary\n${pack.summary}\n\n` +
      `## 🔑 Key Concepts\n` +
      (pack.key_concepts || []).map(k => `- **${k.term}**: ${k.definition}`).join("\n") +
      `\n\n## 🗂 Flashcards\n` +
      (pack.flashcards || []).map((f, i) => `### Card ${i + 1}\n**Q:** ${f.question}\n\n**A:** ${f.answer}\n`).join("\n") +
      `\n## 📝 Practice Quiz\n` +
      (pack.quiz || []).map((q, i) => `### Q${i + 1}. ${q.question}\n` + q.options.map((opt, oIdx) => `- [${String.fromCharCode(65 + oIdx)}] ${opt}`).join("\n") + `\n\n**Answer:** ${String.fromCharCode(65 + q.correct_answer_index)} - ${q.options[q.correct_answer_index]}\n*Explanation: ${q.explanation}*\n`).join("\n");
    mimeType = "text/markdown;charset=utf-8";
    extension = "md";
  } else {
    content = formatStudyPackAsText(pack);
    mimeType = "text/plain;charset=utf-8";
    extension = "txt";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `LearnLite_${sanitizedName}_StudyPack.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

