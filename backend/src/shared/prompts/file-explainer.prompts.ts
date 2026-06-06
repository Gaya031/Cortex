export function buildFileExplanationPrompt(
  fileSummary: any,
  projectContext: any,
) {
  return `
You are a senior software architect.

Your task is to explain a file within the context of the entire project.

========================
FILE SUMMARY
========================

${JSON.stringify(fileSummary, null, 2)}

========================
PROJECT CONTEXT
========================

${JSON.stringify(projectContext, null, 2)}

========================
INSTRUCTIONS
========================

Analyze the file using BOTH:

1. File-level information
2. Project-level architecture information

Explain:

1. Purpose of the file
2. Main responsibilities
3. Internal components/functions
4. Dependencies used by this file
5. Files that depend on this file
6. How this file fits into the overall architecture
7. Architectural risks
8. Impact of modifying this file
9. Suggested improvements

Important:

- Respect stored engineering decisions.
- Consider critical files.
- Consider coupling analysis.
- Consider circular dependencies.
- Consider orphan files.
- Mention architectural implications when relevant.

Return markdown.
`;
}
