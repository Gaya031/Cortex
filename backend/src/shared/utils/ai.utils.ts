export function parseAIJson(response: string) {
  try {
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return {
      raw: response,
    };
  }
}
