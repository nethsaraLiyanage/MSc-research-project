import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, Strategy } from "../api";
import {
  DEFAULT_EVALUATION_PACK_ID,
  EVALUATION_PACKS,
  type EvaluationPack,
  getEvaluationPack,
} from "../content/evaluations";
import { useEngagementTracker } from "../hooks/useEngagementTracker";

type Step =
  | "welcome"
  | "consent"
  | "survey"
  | "prestart"
  | "modality"
  | "results"
  | "postdemo";

const STORAGE_KEY = "ls_student_id";

function loadStudentId(): number | null {
  const v = sessionStorage.getItem(STORAGE_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function saveStudentId(id: number) {
  sessionStorage.setItem(STORAGE_KEY, String(id));
}

export function StudentFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [studentId, setStudentId] = useState<number | null>(loadStudentId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [age, setAge] = useState<number | undefined>(22);
  const [gender, setGender] = useState("");
  const [hearing, setHearing] = useState(0.1);
  const [vision, setVision] = useState(0.1);
  const [focus, setFocus] = useState(0.2);
  const [device, setDevice] = useState(0.85);

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [modIndex, setModIndex] = useState(0);
  const modalities: Strategy[] = useMemo(() => ["video", "audio", "text"], []);

  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [modalityRecords, setModalityRecords] = useState<
    {
      strategy: Strategy;
      time_on_task_sec: number;
      engagement_score: number;
      quiz_score: number;
      completed: boolean;
    }[]
  >([]);

  const [finalRes, setFinalRes] = useState<{
    dwpa: { video: number; audio: number; text: number };
    final: { video: number; audio: number; text: number };
  } | null>(null);

  const [lambdaBlend, setLambdaBlend] = useState(0.45);
  const [evaluationPackId, setEvaluationPackId] = useState(DEFAULT_EVALUATION_PACK_ID);
  const activePack = useMemo(() => getEvaluationPack(evaluationPackId), [evaluationPackId]);

  const learningActive = step === "modality" && phase === "learn";
  const engagementLive = useEngagementTracker(learningActive);

  async function ensureStudent() {
    setError(null);
    if (studentId) return studentId;
    const em = email.trim();
    if (!em) {
      throw new Error("Please enter your email address.");
    }
    const s = await api.createStudent({ email: em, display_name: name.trim() || null });
    saveStudentId(s.id);
    setStudentId(s.id);
    return s.id;
  }

  return (
    <div className="card">
      {error && (
        <p style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      )}

      {step === "welcome" && (
        <>
          <span className="badge">Pre-evaluation</span>
          <h1>Identify your learning strategies</h1>
          <p className="muted">
            This prototype follows your research flow: consent and survey (H, V, F, D), tri-modal
            exposure (video, audio, text), immediate checks, engagement signals, and DWPA fusion.
          </p>
          <label style={{ display: "block", marginTop: "1rem" }}>
            <span className="muted" style={{ display: "block", marginBottom: 6 }}>
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              placeholder="abold@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </label>
          <label style={{ display: "block", marginTop: "0.85rem" }}>
            <span className="muted" style={{ display: "block", marginBottom: 6 }}>
              Display name
            </span>
            <input
              autoComplete="name"
              placeholder="e.g. Alex Bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <div style={{ marginTop: "1.25rem" }}>
            <button
              type="button"
              disabled={!email.trim()}
              onClick={async () => {
                try {
                  await ensureStudent();
                  setStep("consent");
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === "consent" && (
        <>
          <h2>Consent</h2>
          <p>
            Data from the onboarding survey and session activity is used only to estimate modality
            weights and to support tutor-level analytics. Your email is stored with your profile for
            identification and institute reporting. You may withdraw by stopping the session.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={async () => {
                try {
                  const id = await ensureStudent();
                  await api.consent(id);
                  setStep("survey");
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              I agree
            </button>
          </div>
        </>
      )}

      {step === "survey" && (
        <>
          <h2>Background survey</h2>
          <p className="muted">Map your literature factors into [0,1] severity / capability sliders.</p>
          <label>
            Age
            <input
              type="number"
              value={age ?? ""}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
          <label style={{ display: "block", marginTop: 12 }}>
            Gender (optional)
            <input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          {(
            [
              ["H — hearing-related barriers", hearing, setHearing],
              ["V — vision-related barriers", vision, setVision],
              ["F — focus-related barriers", focus, setFocus],
              ["D — device suitability (higher = better)", device, setDevice],
            ] as const
          ).map(([label, val, set]) => (
            <div key={label} className="bar-wrap">
              <label>
                <span>{label}</span>
                <span>{val.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={async () => {
              try {
                const id = await ensureStudent();
                await api.survey(id, {
                  age: age ?? null,
                  gender: gender || null,
                  hearing_issue: hearing,
                  vision_issue: vision,
                  focus_issue: focus,
                  device_score: device,
                });
                setStep("prestart");
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Save and continue
          </button>
        </>
      )}

      {step === "prestart" && (
        <>
          <h2>Tri-modal pre-evaluation</h2>
          <p>
            You will study the same short concept as <strong>video</strong>, then <strong>audio</strong>, then{" "}
            <strong>text</strong>, each followed by a quick quiz tied to that topic. Engagement is approximated
            from active tab time (facial affect can plug into the same API field later).
          </p>
          <fieldset
            style={{
              border: "1px solid var(--surface2)",
              borderRadius: 12,
              padding: "1rem 1rem 0.25rem",
              margin: "1rem 0",
            }}
          >
            <legend className="muted" style={{ padding: "0 0.35rem" }}>
              Evaluation topic
            </legend>
            {EVALUATION_PACKS.map((p) => (
              <label
                key={p.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="evaluation-pack"
                  checked={evaluationPackId === p.id}
                  onChange={() => setEvaluationPackId(p.id)}
                  style={{ marginTop: 4 }}
                />
                <span>
                  <strong style={{ display: "block" }}>{p.label}</strong>
                  <span className="muted" style={{ fontSize: "0.9rem" }}>
                    {p.summary}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="bar-wrap" style={{ display: "block" }}>
            <span>λ — blend DWPA prior vs. observed performance ({lambdaBlend.toFixed(2)})</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={lambdaBlend}
              onChange={(e) => setLambdaBlend(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <button
            type="button"
            onClick={async () => {
              try {
                const id = await ensureStudent();
                const sess = await api.startPreEval(id);
                setSessionId(sess.id);
                setModIndex(0);
                setPhase("learn");
                setAnswers([]);
                setStartedAt(performance.now());
                setModalityRecords([]);
                setStep("modality");
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Start session
          </button>
        </>
      )}

      {step === "modality" && sessionId != null && (
        <ModalityStep
          key={`${sessionId}-${modIndex}-${activePack.id}`}
          pack={activePack}
          strategy={modalities[modIndex]}
          phase={phase}
          setPhase={setPhase}
          engagementLive={engagementLive}
          startedAt={startedAt}
          setStartedAt={setStartedAt}
          answers={answers}
          setAnswers={setAnswers}
          onFinishModality={({ timeSec, engagement, quizScore }) => {
            const strat = modalities[modIndex];
            const next = [
              ...modalityRecords,
              {
                strategy: strat,
                time_on_task_sec: timeSec,
                engagement_score: engagement,
                quiz_score: quizScore,
                completed: true,
              },
            ];
            setModalityRecords(next);
            if (modIndex + 1 < modalities.length) {
              setModIndex(modIndex + 1);
              setPhase("learn");
              setAnswers([]);
              setStartedAt(performance.now());
            } else {
              void (async () => {
                try {
                  const r = await api.completePreEval(sessionId, {
                    lambda_blend: lambdaBlend,
                    modalities: next,
                  });
                  setFinalRes({
                    dwpa: {
                      video: r.dwpa_video ?? 0.33,
                      audio: r.dwpa_audio ?? 0.33,
                      text: r.dwpa_text ?? 0.34,
                    },
                    final: {
                      video: r.final_video ?? 0.33,
                      audio: r.final_audio ?? 0.33,
                      text: r.final_text ?? 0.34,
                    },
                  });
                  setStep("results");
                } catch (e) {
                  setError(String(e));
                }
              })();
            }
          }}
        />
      )}

      {step === "results" && finalRes && (
        <>
          <h2>Your strategy weights</h2>
          <p className="muted">
            Topic: <strong>{activePack.label}</strong>. DWPA (survey + H,V,F,D) vs. fused output after
            quizzes and engagement.
          </p>
          <WeightBars label="DWPA prior" w={finalRes.dwpa} />
          <div style={{ height: 12 }} />
          <WeightBars label="Fused recommendation" w={finalRes.final} />
          <p style={{ marginTop: "1.25rem" }}>
            Tutors can monitor batch trends and post-evaluation marks from the{" "}
            <Link to="/tutor">institute view</Link>.
          </p>
          <button type="button" onClick={() => setStep("postdemo")} style={{ marginTop: 12 }}>
            Simulate post-evaluation marks
          </button>
        </>
      )}

      {step === "postdemo" && studentId != null && (
        <PostDemo studentId={studentId} />
      )}
    </div>
  );
}

function WeightBars({ label, w }: { label: string; w: { video: number; audio: number; text: number } }) {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>{label}</h3>
      {(["video", "audio", "text"] as const).map((k) => (
        <div key={k} className="bar-wrap">
          <label>
            <span style={{ textTransform: "capitalize" }}>{k}</span>
            <span>{(w[k] * 100).toFixed(1)}%</span>
          </label>
          <div className="bar">
            <span style={{ width: `${Math.min(100, w[k] * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalityStep({
  pack,
  strategy,
  phase,
  setPhase,
  engagementLive,
  startedAt,
  setStartedAt,
  answers,
  setAnswers,
  onFinishModality,
}: {
  pack: EvaluationPack;
  strategy: Strategy;
  phase: "learn" | "quiz";
  setPhase: (p: "learn" | "quiz") => void;
  engagementLive: number;
  startedAt: number | null;
  setStartedAt: (t: number) => void;
  answers: number[];
  setAnswers: (a: number[]) => void;
  onFinishModality: (p: { timeSec: number; engagement: number; quizScore: number }) => void;
}) {
  const t0 = startedAt ?? performance.now();

  return (
    <>
      <span className="badge" style={{ textTransform: "capitalize" }}>
        {strategy}
      </span>
      <h2>{pack.title}</h2>

      {phase === "learn" && (
        <>
          {strategy === "video" && (
            <>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  src={pack.video.embedSrc}
                  title={pack.video.providerTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <p className="muted" style={{ marginTop: 10, fontSize: "0.88rem" }}>
                If the player shows &quot;Video unavailable&quot; (private video, embed disabled, or region
                block),{" "}
                <a href={pack.video.watchUrl} target="_blank" rel="noopener noreferrer">
                  open the lesson on YouTube
                </a>{" "}
                in a new tab — you can still continue the pre-evaluation flow.
              </p>
            </>
          )}
          {strategy === "audio" && (
            <figure style={{ margin: "1rem 0" }}>
              <figcaption className="muted" style={{ marginBottom: 8 }}>
                Listen to the narration (same concept as video/text).
              </figcaption>
              <audio controls style={{ width: "100%" }} src={pack.audio.src}>
                Your browser does not support audio.
              </audio>
              <p className="muted" style={{ marginTop: 8, fontSize: "0.85rem" }}>
                {pack.audio.footnote}
              </p>
            </figure>
          )}
          {strategy === "text" && (
            <div
              style={{
                maxHeight: 280,
                overflow: "auto",
                padding: "0.75rem 1rem",
                background: "var(--surface2)",
                borderRadius: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {pack.textBody.trim()}
            </div>
          )}

          <p className="muted" style={{ marginTop: 12 }}>
            Live engagement proxy: {(engagementLive * 100).toFixed(0)}% (tab focus)
          </p>
          <button
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => {
              if (!startedAt) setStartedAt(performance.now());
              setPhase("quiz");
            }}
          >
            I’m ready for the quiz
          </button>
        </>
      )}

      {phase === "quiz" && (
        <>
          {pack.quiz.map((item, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <p>
                <strong>
                  {idx + 1}. {item.q}
                </strong>
              </p>
              <div className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                {item.options.map((opt, oi) => (
                  <label key={oi} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      name={`q-${pack.id}-${strategy}-${idx}`}
                      checked={answers[idx] === oi}
                      onChange={() => {
                        const cp = [...answers];
                        cp[idx] = oi;
                        setAnswers(cp);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={pack.quiz.some((_, i) => answers[i] === undefined)}
            onClick={() => {
              const correct = pack.quiz.filter((q, i) => answers[i] === q.correct).length;
              const quizScore = correct / pack.quiz.length;
              const elapsed = (performance.now() - t0) / 1000;
              onFinishModality({
                timeSec: elapsed,
                engagement: engagementLive,
                quizScore,
              });
            }}
          >
            Submit modality
          </button>
        </>
      )}
    </>
  );
}

function PostDemo({ studentId }: { studentId: number }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <h2>Post-evaluation demo</h2>
      <p className="muted">
        Add a few marks; the API computes a simple trend and flags whether to re-run pre-evaluation.
      </p>
      <div className="row">
        <button
          type="button"
          onClick={async () => {
            const id = `quiz-${Date.now()}`;
            await api.postMark(studentId, id, 78 + Math.random() * 10);
            const s = await api.postStatus(studentId);
            setMsg(
              `Trend ratio: ${s.trend_ratio?.toFixed(2) ?? "n/a"} — re-run pre-eval: ${s.should_reiterate_pre_eval}`
            );
          }}
        >
          Add sample mark (~high)
        </button>
        <button
          type="button"
          onClick={async () => {
            const id = `quiz-${Date.now()}`;
            await api.postMark(studentId, id, 35 + Math.random() * 12);
            const s = await api.postStatus(studentId);
            setMsg(
              `Trend ratio: ${s.trend_ratio?.toFixed(2) ?? "n/a"} — re-run pre-eval: ${s.should_reiterate_pre_eval}`
            );
          }}
        >
          Add sample mark (~low)
        </button>
      </div>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </>
  );
}
