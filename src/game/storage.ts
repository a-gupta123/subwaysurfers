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

let cached: History | null = null;
let queue: Promise<void> = Promise.resolve();

function isRun(value: unknown): value is SavedRun {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const run = value as SavedRun;
  return typeof run.score === 'number' && typeof run.endedAt === 'string' && typeof run.reason === 'string';
}

function copyHistory(history: History): History {
  return {
    best: history.best,
    runs: history.runs.map((run) => ({ ...run })),
  };
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readHistory(): Promise<History> {
  if (cached) {
    return cached;
  }
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    cached = { best: 0, runs: [] };
    return cached;
  }
  const parsed = JSON.parse(raw) as Partial<History>;
  const runs = Array.isArray(parsed.runs) ? parsed.runs.filter(isRun) : [];
  const bestFromRuns = runs.reduce((highest, run) => Math.max(highest, run.score), 0);
  const best = typeof parsed.best === 'number' ? Math.max(parsed.best, bestFromRuns) : bestFromRuns;
  cached = { best, runs };
  return cached;
}

export function loadHistory(): Promise<History> {
  return enqueue(async () => copyHistory(await readHistory()));
}

export function recordRun(run: SavedRun): Promise<History> {
  return enqueue(async () => {
    const current = await readHistory();
    const runs = [run, ...current.runs].slice(0, 30);
    const next: History = {
      best: Math.max(current.best, run.score),
      runs,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    cached = next;
    return copyHistory(next);
  });
}

export function latestRuns(history: History): SavedRun[] {
  return history.runs.slice(0, 5);
}
