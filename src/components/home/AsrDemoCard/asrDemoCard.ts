import {WordAlignment} from "@/utils/dictate";

export interface Segment {
  id: string
  wordAlignment: WordAlignment[];
  segmentStart: Date;
  segmentLength: number;
}
