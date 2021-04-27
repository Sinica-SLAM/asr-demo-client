import { Candidate } from "@/utils/candidates";
import { WordAlignment } from "@/utils/dictate";

export interface Segment {
  id: string;
  text: string;
  wordAlignment: WordAlignment[];
  segmentStart: Date;
  segmentLength: number;
  completed: boolean;
  candidatesMap: Map<number, Candidate[]>;
}
