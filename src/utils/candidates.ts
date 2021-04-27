import { Hypothesis, WordAlignment } from "./dictate";

export function getCandidates(
  hypotheses: Hypothesis[]
): Map<number, Candidate[]> {
  const candidates = new Map<number, Candidate[]>();

  for (const word of hypotheses[0]["word-alignment"] ?? []) {
    candidates.set(word.start, []);
  }

  for (const hypothesis of hypotheses) {
    for (const word of hypothesis["word-alignment"] ?? []) {
      if (candidates.has(word.start)) {
        const candidate = candidates.get(word.start) as Candidate[];
        if (
          candidate.findIndex((candidate) => candidate.word === word.word) ===
          -1
        ) {
          candidate.push({ confidence: word.confidence, word: word.word });
        }
      }
    }
  }

  candidates.forEach((candidate) => {
    candidate.sort((l, r) => (l.confidence < r.confidence ? 1 : -1));
  });

  return candidates;
}

export function getCandidatesFlat(
  wordAlignments: WordAlignment[][]
): Map<number, Candidate[]> {
  const candidates = new Map<number, Candidate[]>();

  for (const word of wordAlignments[0] ?? []) {
    candidates.set(word.start, []);
  }

  for (const wordAlignment of wordAlignments) {
    for (const word of wordAlignment) {
      if (candidates.has(word.start)) {
        const candidate = candidates.get(word.start) as Candidate[];
        if (
          candidate.findIndex((candidate) => candidate.word === word.word) ===
          -1
        ) {
          candidate.push({ confidence: word.confidence, word: word.word });
        }
      }
    }
  }

  candidates.forEach((candidate) => {
    candidate.sort((l, r) => (l.confidence < r.confidence ? 1 : -1));
  });

  return candidates;
}

export interface Candidate {
  confidence: number;
  word: string;
}
