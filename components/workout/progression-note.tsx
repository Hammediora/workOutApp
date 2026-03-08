// components/workout/progression-note.tsx

interface ProgressionNoteProps {
  goal: string;
}

const GOAL_NOTES: Record<string, { headline: string; body: string }> = {
  fat_loss: {
    headline: "Add weight every week.",
    body: "Aim for 2.5–5 lb increases each session. Getting stronger while in a deficit is the fastest body composition change you can make.",
  },
  strength: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases on your main lifts each session. Progressive overload is the only mechanism that drives strength adaptation.",
  },
  muscle_gain: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases across the board. Muscles grow in response to progressive tension — the number must go up over time.",
  },
  general_fitness: {
    headline: "Add weight every week.",
    body: "Aim for 5 lb increases each session. Small, consistent gains compound into significant results. Write down what you lift — beat it next time.",
  },
};

const DEFAULT_NOTE = {
  headline: "Add weight every week.",
  body: "Aim to increase each lift by 5 lbs per session. Progressive overload is the primary driver of every training adaptation.",
};

export function ProgressionNote({ goal }: ProgressionNoteProps) {
  const note = GOAL_NOTES[goal] ?? DEFAULT_NOTE;

  return (
    <div className="pl-4 border-l-2 border-foreground/20 space-y-1">
      <p className="text-sm font-semibold tracking-tight">{note.headline}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{note.body}</p>
    </div>
  );
}
