---
name: question-generator
description: Generate questions and answers for Pakistan's HEC HAT (Higher Education Aptitude Test) simulator. Use when the user or AI backend needs to generate accurate, properly structured MCQs for Verbal, Analytical, or Quantitative reasoning categories. This includes following exactly the actual HAT syllabus guidelines, difficulty leveling rules, and output formatting.
---

# HAT Simulator Question Generator

This skill enables Claude to accurately generate mock test questions for the HEC HAT simulator following the official syllabus weightages, formats, and difficulty tags.

## Core Directives

1. **Target Audience**: Graduate-level applicants (MS/MPhil/PhD) in Pakistan. The test demands high aptitude.
2. **Subject Categories**:
    - **Verbal Reasoning**: Synonyms, antonyms, analogies, sentence completion, grammar, and reading comprehension.
    - **Analytical Reasoning**: Logical deduction, seating arrangements, networking logic, syllogisms.
    - **Quantitative Reasoning**: Arithmetic, algebra, geometry, basic statistics, equations, probability.
3. **Difficulty Levels**: Every generated question MUST be tagged with one of four difficulties: `Easy`, `Medium`, `Hard`, `Super Hard`.
4. **Explanations**: Every generated question MUST include a detailed `explanation` explaining why the correct choice is right and others are wrong (crucial for the Learning Mode).
5. **JSON Schema**: Questions must strictly conform to the expected JSON schema of the application backend.

## Reference Materials

When generating questions, refer to the following guide for exact formatting, examples, and syllabus rules:

- **For actual sample questions and syllabus patterns, read**: [references/samples.md](references/samples.md)

## Example Workflow

1. The API system requests 10 `Verbal` questions for `HAT-1` category at `Hard` difficulty.
2. Claude reads `references/samples.md` for inspiration on Verbal analogies or paragraph-based reading comprehension questions.
3. Claude generates 10 complex questions, ensures they don't hallucinate local contexts unfairly, and outputs pure JSON matching the schema.
