import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type { Identity, Run, Receipt, Answer } from "../shared/types.js";
import { publicQuestion, questions, grade } from "./questions.js";
const secret = () => {
  const s = process.env.RUN_SIGNING_SECRET;
  if (!s || s.length < 32) throw Error("Server belum dikonfigurasi.");
  return s;
};
export function sign(value: unknown) {
  const data = Buffer.from(JSON.stringify(value)).toString("base64url");
  return (
    data + "." + createHmac("sha256", secret()).update(data).digest("base64url")
  );
}
export function unseal(token: unknown): any {
  if (typeof token !== "string" || token.length > 12000)
    throw Error("Kode tidak valid.");
  const [data, sig, ...extra] = token.split(".");
  const expected = createHmac("sha256", secret())
    .update(data ?? "")
    .digest();
  const actual = Buffer.from(sig ?? "", "base64url");
  if (
    extra.length ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  )
    throw Error("Kode berubah atau tidak valid.");
  return JSON.parse(Buffer.from(data, "base64url").toString());
}
function identity(value: any): Identity {
  const get = (key: string, max: number) => {
    const s = typeof value?.[key] === "string" ? value[key].trim() : "";
    if (!s || s.length > max)
      throw Error("Isi nama, NIM, dan kelas dengan benar.");
    return s;
  };
  return {
    name: get("name", 80),
    student: get("student", 40),
    kelas: get("kelas", 40),
  };
}
export function runOf(token: unknown): Run {
  const r = unseal(token) as Run;
  if (
    r.v !== 1 ||
    !r.id ||
    !r.identity ||
    !Array.isArray(r.answers) ||
    r.answers.length > 8 ||
    r.answers.some((a) => typeof a !== "boolean") ||
    r.expiresAt < Date.now() ||
    r.revision !== r.answers.length
  )
    throw Error("Sesi kedaluwarsa atau tidak valid.");
  return r;
}
export function handle(action: string, body: any): any {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw Error("Request tidak valid.");
  if (action === "start") {
    const now = Date.now();
    const run: Run = {
      v: 1,
      id: randomUUID(),
      identity: identity(body.identity),
      startedAt: now,
      expiresAt: now + 7 * 86400000,
      answers: [],
      revision: 0,
    };
    return { token: sign(run), run };
  }
  if (action === "verify") {
    const value = unseal(body.code);
    if (
      value.kind !== "receipt" ||
      value.receipt?.v !== 1 ||
      value.receipt.total !== 8
    )
      throw Error("Ini bukan kode bukti hasil.");
    return { receipt: value.receipt, valid: true };
  }
  const run = runOf(body.token);
  if (action === "resume") return { run };
  if (action === "question") {
    if (run.answers.length >= 8) throw Error("Semua tantangan sudah selesai.");
    return { question: publicQuestion(run.answers.length) };
  }
  if (action === "submit") {
    const i = run.answers.length;
    if (i >= 8) throw Error("Semua tantangan sudah selesai.");
    if (body.questionId !== questions[i].id)
      throw Error("Urutan tantangan berubah. Muat ulang tantangan.");
    const answer = body.answer as Answer;
    const q = questions[i];
    if (q.kind === "single") {
      if (typeof answer !== "string" || !q.options.some((o) => o.id === answer))
        throw Error("Pilih satu jawaban.");
    } else {
      const size = q.kind === "order" ? q.options.length : q.rows!.length;
      if (
        !Array.isArray(answer) ||
        answer.length !== size ||
        answer.some(
          (a) => typeof a !== "string" || !q.options.some((o) => o.id === a),
        ) ||
        (q.kind === "order" && new Set(answer).size !== size)
      )
        throw Error("Lengkapi semua bagian jawaban.");
    }
    const correct = grade(i, answer);
    run.answers.push(correct);
    run.revision++;
    return {
      token: sign(run),
      run,
      correct,
      expected: q.expected,
      explanation: q.explanation,
    };
  }
  if (action === "result") {
    if (run.answers.length !== 8)
      throw Error("Selesaikan delapan tantangan dahulu.");
    const receipt: Receipt = {
      v: 1,
      id: run.id,
      identity: run.identity,
      score: run.answers.filter(Boolean).length * 12.5,
      correct: run.answers.filter(Boolean).length,
      total: 8,
      startedAt: run.startedAt,
      finishedAt: Date.now(),
    };
    return { receipt, code: sign({ kind: "receipt", receipt }) };
  }
  throw Error("Operasi tidak ditemukan.");
}
export function endpoint(action: string) {
  return (req: any, res: any) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST")
      return res.status(405).json({ error: "Gunakan POST." });
    try {
      if (JSON.stringify(req.body ?? {}).length > 18000)
        return res.status(413).json({ error: "Request terlalu besar." });
      return res.status(200).json(handle(action, req.body));
    } catch (e) {
      return res
        .status(400)
        .json({ error: e instanceof Error ? e.message : "Request gagal." });
    }
  };
}
