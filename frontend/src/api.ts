const base = "";

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const t = await r.text();
  if (!r.ok) {
    let msg = t || r.statusText;
    try {
      const o = JSON.parse(t) as {
        detail?: string | Array<{ msg?: string } | string>;
      };
      if (typeof o.detail === "string") msg = o.detail;
      else if (Array.isArray(o.detail))
        msg = o.detail
          .map((d) => (typeof d === "object" && d && "msg" in d && d.msg ? d.msg : String(d)))
          .join("; ");
    } catch {
      /* use msg as-is */
    }
    throw new Error(msg);
  }
  return (t ? JSON.parse(t) : {}) as T;
}

export type Strategy = "video" | "audio" | "text";

export type Weights = { video: number; audio: number; text: number };

export const api = {
  createStudent: (body: { email: string; display_name?: string | null }) =>
    j<{ id: number; email: string | null; display_name: string | null }>("/students", {
      method: "POST",
      body: JSON.stringify({
        email: body.email.trim(),
        display_name: body.display_name?.trim() || null,
      }),
    }),

  consent: (studentId: number) =>
    j<{ ok: boolean }>(`/students/${studentId}/consent`, {
      method: "POST",
      body: JSON.stringify({ accepted: true, version: "1.0" }),
    }),

  survey: (
    studentId: number,
    body: {
      age?: number | null;
      gender?: string | null;
      hearing_issue: number;
      vision_issue: number;
      focus_issue: number;
      device_score: number;
    }
  ) => j<{ id: number }>(`/students/${studentId}/survey`, { method: "POST", body: JSON.stringify(body) }),

  startPreEval: (studentId: number) =>
    j<{
      id: number;
      student_id: number;
      dwpa_video: number | null;
      dwpa_audio: number | null;
      dwpa_text: number | null;
      status: string;
    }>(`/pre-eval/sessions/start?student_id=${studentId}`, { method: "POST" }),

  completePreEval: (
    sessionId: number,
    body: {
      lambda_blend: number;
      modalities: {
        strategy: Strategy;
        time_on_task_sec: number;
        engagement_score: number;
        quiz_score: number;
        completed: boolean;
      }[];
    }
  ) =>
    j<{
      id: number;
      final_video: number | null;
      final_audio: number | null;
      final_text: number | null;
      dwpa_video: number | null;
      dwpa_audio: number | null;
      dwpa_text: number | null;
    }>(`/pre-eval/sessions/${sessionId}/complete`, { method: "POST", body: JSON.stringify(body) }),

  postMark: (studentId: number, assessment_id: string, score: number, max_score = 100) =>
    j<{ id: number }>(`/post-eval/students/${studentId}/marks`, {
      method: "POST",
      body: JSON.stringify({ assessment_id, score, max_score }),
    }),

  postStatus: (studentId: number) =>
    j<{ trend_ratio: number | null; should_reiterate_pre_eval: boolean }>(
      `/post-eval/students/${studentId}/status`
    ),

  tutorBatch: () =>
    j<
      {
        student_id: number;
        email: string | null;
        display_name: string | null;
        last_final: Weights | null;
        trend_ratio: number | null;
        reiterate: boolean;
      }[]
    >("/tutor/batch-summary"),
};
