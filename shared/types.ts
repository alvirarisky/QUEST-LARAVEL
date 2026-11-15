export type Identity = { name: string; student: string; kelas: string };
export type Option = { id: string; text: string };
export type Question = {
  id: string;
  number: number;
  title: string;
  context: string;
  instruction: string;
  kind: "single" | "match" | "order";
  options: Option[];
  rows?: string[];
};
export type Answer = string | string[];
export type Run = {
  v: 1;
  id: string;
  identity: Identity;
  startedAt: number;
  expiresAt: number;
  answers: boolean[];
  revision: number;
};
export type Receipt = {
  v: 1;
  id: string;
  identity: Identity;
  score: number;
  correct: number;
  total: 8;
  startedAt: number;
  finishedAt: number;
};
