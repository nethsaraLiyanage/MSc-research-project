/**
 * Pre-evaluation packs: each type has its own references (video / audio / text) and quiz.
 * Add or edit packs here; the UI lets the learner pick one before the tri-modal session.
 */

export type QuizQuestion = {
  q: string;
  options: readonly string[];
  /** Index of the correct option */
  correct: number;
};

export type EvaluationPack = {
  id: string;
  /** Short name in the selector */
  label: string;
  /** One-line description for the selector */
  summary: string;
  /** Lesson heading shown during video/audio/text steps */
  title: string;
  textBody: string;
  video: {
    embedSrc: string;
    watchUrl: string;
    providerTitle: string;
  };
  audio: {
    src: string;
    footnote: string;
  };
  quiz: readonly QuizQuestion[];
};

export const EVALUATION_PACKS: readonly EvaluationPack[] = [
  {
    id: "big-o",
    label: "Algorithm complexity (Big-O)",
    summary: "How runtime grows with input size — pairs with DWPA modality checks.",
    title: "Big-O notation (intro)",
    textBody: `
Big-O describes how runtime or memory grows as input size n increases.
O(1) means constant time: work does not grow with n.
O(n) means linear: work scales proportionally with n.
O(n²) often appears in naive nested loops over the same collection.

For example, scanning an array once to find a maximum is O(n).
Comparing every pair of elements is O(n²) in the worst case.
`.trim(),
    video: {
      embedSrc:
        "https://www.youtube-nocookie.com/embed/gxBkZvi18Ec?rel=0&modestbranding=1",
      watchUrl: "https://www.youtube.com/watch?v=gxBkZvi18Ec",
      providerTitle: "What is Big O? — CS Dojo",
    },
    audio: {
      src: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav",
      footnote: "Placeholder audio — replace with your narrated Big-O clip.",
    },
    quiz: [
      {
        q: "Which complexity best describes a single pass over an array of length n?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct: 2,
      },
      {
        q: "Nested loops that compare all pairs in an array of length n are typically:",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        correct: 2,
      },
      {
        q: "O(1) means:",
        options: [
          "The algorithm uses one variable",
          "Runtime does not depend on input size n",
          "The input has size 1",
          "Only one loop is allowed",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "recursion",
    label: "Recursion",
    summary: "Base cases, stack frames, and when recursion is appropriate.",
    title: "Recursion (intro)",
    textBody: `
Recursion means a function calls itself (directly or indirectly) on a smaller or simpler subproblem.

Every recursive design needs:
• One or more base cases that stop the recursion.
• A recursive step that moves toward a base case.

Each call usually creates a new stack frame, so deep recursion can cause a stack overflow.
Many algorithms (trees, divide-and-conquer) are naturally expressed recursively.
`.trim(),
    video: {
      embedSrc:
        "https://www.youtube-nocookie.com/embed/7F3GOhkTcOM?rel=0&modestbranding=1",
      watchUrl: "https://www.youtube.com/watch?v=7F3GOhkTcOM",
      providerTitle: "What is recursion? — short intro",
    },
    audio: {
      src: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav",
      footnote: "Placeholder audio — replace with your narrated recursion lesson.",
    },
    quiz: [
      {
        q: "What must a correct recursive solution eventually reach?",
        options: [
          "A base case that stops further calls",
          "A loop variable equal to zero",
          "A global maximum",
          "Compilation in O(1) time",
        ],
        correct: 0,
      },
      {
        q: "Each recursive call typically adds a new …",
        options: ["Stack frame", "Heap segment", "CPU core", "Database row"],
        correct: 0,
      },
      {
        q: "Recursion with no reachable base case often leads to …",
        options: [
          "Stack overflow",
          "Guaranteed O(1) memory",
          "Automatic tail-call optimization on all platforms",
          "Stronger static typing",
        ],
        correct: 0,
      },
    ],
  },
  {
    id: "stacks-queues",
    label: "Stacks & queues",
    summary: "LIFO vs FIFO — typical operations and use cases.",
    title: "Stacks and queues",
    textBody: `
A stack follows Last-In-First-Out (LIFO). Push adds to the top; pop removes from the top.
Classic uses: undo stacks, parsing, depth-first traversal helpers.

A queue follows First-In-First-Out (FIFO). Enqueue adds at the rear; dequeue removes from the front.
Classic uses: scheduling, breadth-first search, buffering streams.

Both can be implemented with arrays (watch capacity) or linked structures.
`.trim(),
    video: {
      embedSrc:
        "https://www.youtube-nocookie.com/embed/5JQxVmQFFHE?rel=0&modestbranding=1",
      watchUrl: "https://www.youtube.com/watch?v=5JQxVmQFFHE",
      providerTitle: "Stacks — overview (swap embed if unavailable)",
    },
    audio: {
      src: "https://www2.cs.uic.edu/~i101/SoundFiles/Startrek60.wav",
      footnote: "Placeholder audio — replace with stacks/queues narration.",
    },
    quiz: [
      {
        q: "Which ordering does a stack enforce?",
        options: ["LIFO", "FIFO", "Random access only", "Sorted by key"],
        correct: 0,
      },
      {
        q: "A fair line at a help desk is best modeled as a …",
        options: ["Stack", "Queue", "Binary search tree", "Hash set"],
        correct: 1,
      },
      {
        q: "“Push” and “pop” usually refer to operations on a …",
        options: ["Stack", "Queue", "Graph", "Heap (memory region only)"],
        correct: 0,
      },
    ],
  },
] as const;

export const DEFAULT_EVALUATION_PACK_ID = EVALUATION_PACKS[0].id;

export function getEvaluationPack(id: string): EvaluationPack {
  const found = EVALUATION_PACKS.find((p) => p.id === id);
  return found ?? EVALUATION_PACKS[0];
}
