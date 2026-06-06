export function buildProjectExplanationPrompt(context: any) {
  return `
You are a principal software architect.

Analyze the following project.

PROJECT CONTEXT:

${JSON.stringify(context, null, 2)}

Explain:

1. Overall architecture
2. Core modules
3. Dependency structure
4. Critical files and why they matter
5. High coupling areas
6. Circular dependencies
7. Potential risks
8. Engineering decisions
9. Recommended improvements

Return markdown.
`;
}
