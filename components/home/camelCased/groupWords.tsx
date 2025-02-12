export function groupWords(text: string, groupSize: number): string[] {
  const words = text.split(" ");
  const groups = [];
  for (let i = 0; i < words.length; i += groupSize) {
    groups.push(words.slice(i, i + groupSize).join(" "));
  }
  return groups;
}