export type Lane = 0 | 1 | 2;

export type ObstacleKind = 'robot' | 'tour';

export function moveLane(lane: Lane, direction: -1 | 1): Lane {
  const next = lane + direction;
  if (next < 0 || next > 2) {
    return lane;
  }
  return next as Lane;
}

export function runSpeed(elapsedSeconds: number): number {
  return Math.min(0.95, 0.32 + elapsedSeconds * 0.028);
}

export function spawnGap(elapsedSeconds: number): number {
  return Math.max(0.48, 1.25 - elapsedSeconds * 0.035);
}

export function scoreForTime(elapsedSeconds: number): number {
  return Math.floor(elapsedSeconds * 10);
}

const ROBOT_REASONS = [
  'A delivery robot boxed you in on the sidewalk.',
  'You lost a staring contest with a delivery robot.',
  'A robot decided your lane was a loading zone.',
];

const TOUR_REASONS = [
  'A tour group stopped for a photo in your lane.',
  'You became an unplanned stop on the campus tour.',
  'A tour group unfolded a map, and you did not.',
];

export function missReason(kind: ObstacleKind): string {
  const choices = kind === 'robot' ? ROBOT_REASONS : TOUR_REASONS;
  return choices[Math.floor(Math.random() * choices.length)] ?? choices[0];
}
