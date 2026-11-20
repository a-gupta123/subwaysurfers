import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'late-to-class.history.v1';

export type SavedRun = {
  score: number;
  endedAt: string;
  reason: string;
};

export type History = {
  best: number;
  runs: SavedRun[];
};

const EMPTY: History = { best: 0, runs: [] };

function isRun(value: unknown): value is SavedRun {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const run = value as SavedRun;
  return typeof run.score === 'number' && typeof run.endedAt === 'string' && typeof run.reason === 'string';
}

export async function loadHistory(): Promise<History> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return EMPTY;
  }
  const parsed = JSON.parse(raw) as Partial<History>;
  const runs = Array.isArray(parsed.runs) ? parsed.runs.filter(isRun) : [];
  const bestFromRuns = runs.reduce((highest, run) => Math.max(highest, run.score), 0);
  const best = typeof parsed.best === 'number' ? Math.max(parsed.best, bestFromRuns) : bestFromRuns;
  return { best, runs };
}

export async function recordRun(run: SavedRun): Promise<History> {
  const current = await loadHistory();
  const runs = [run, ...current.runs].slice(0, 30);
  const next: History = {
    best: Math.max(current.best, run.score),
    runs,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function latestRuns(history: History): SavedRun[] {
  return history.runs.slice(0, 5);
}
