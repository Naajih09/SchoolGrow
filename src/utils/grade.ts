export function gradeFromScore(score: number) {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function average(scores: number[]) {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

