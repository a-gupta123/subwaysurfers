import { router, useIsFocused, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { campus } from '@/game/colors';
import { bodiesOverlap, Lane, missReason, ObstacleKind, runSpeed, scoreForTime, spawnGap, moveLane } from '@/game/run';
import { loadHistory, recordRun } from '@/game/storage';

type Obstacle = {
  id: number;
  lane: Lane;
  y: number;
  kind: ObstacleKind;
};

const PLAYER_Y = 0.78;
const SPRITE_BLOCK_PX = 58;

export default function PlayScreen() {
  const focused = useIsFocused();
  const [phase, setPhase] = useState<'ready' | 'running' | 'over'>('ready');
  const [lane, setLane] = useState<Lane>(1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [reason, setReason] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [trackHeight, setTrackHeight] = useState(0);

  const phaseRef = useRef(phase);
  const laneRef = useRef<Lane>(1);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const elapsedRef = useRef(0);
  const spawnRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const savingRef = useRef(false);
  const trackHeightRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    loadHistory()
      .then((history) => setBest(history.best))
      .catch(() => setBest(0));
  }, []);

  function beginRun() {
    laneRef.current = 1;
    obstaclesRef.current = [];
    elapsedRef.current = 0;
    spawnRef.current = 0;
    lastTsRef.current = null;
    savingRef.current = false;
    setLane(1);
    setObstacles([]);
    setScore(0);
    setReason('');
    setSaveError(null);
    setPhase('running');
  }

  useEffect(() => {
    if (phase !== 'running' || !focused) {
      lastTsRef.current = null;
      return;
    }

    let frame = 0;
    let stopped = false;

    const finish = (kind: ObstacleKind, finalScore: number) => {
      if (savingRef.current) {
        return;
      }
      savingRef.current = true;
      stopped = true;
      const missed = missReason(kind);
      setScore(finalScore);
      setReason(missed);
      setPhase('over');
      recordRun({
        score: finalScore,
        endedAt: new Date().toISOString(),
        reason: missed,
      })
        .then((history) => setBest(history.best))
        .catch(() => setSaveError('This run could not be saved on this phone.'));
    };

    const tick = (timestamp: number) => {
      if (stopped) {
        return;
      }
      if (lastTsRef.current == null) {
        lastTsRef.current = timestamp;
      }
      const dt = Math.min(0.05, (timestamp - lastTsRef.current) / 1000);
      lastTsRef.current = timestamp;
      elapsedRef.current += dt;

      const speed = runSpeed(elapsedRef.current);
      spawnRef.current += dt;
      if (spawnRef.current >= spawnGap(elapsedRef.current)) {
        spawnRef.current = 0;
        const next: Obstacle = {
          id: idRef.current++,
          lane: Math.floor(Math.random() * 3) as Lane,
          y: -0.16,
          kind: Math.random() < 0.5 ? 'robot' : 'tour',
        };
        obstaclesRef.current = [...obstaclesRef.current, next];
      }

      const trackHeight = trackHeightRef.current;
      const drawnSpan = trackHeight > 0 ? Math.min(0.2, SPRITE_BLOCK_PX / trackHeight) : 0.12;
      const spriteSpan = Math.max(0.06, drawnSpan);
      let hit: Obstacle | null = null;
      const moved: Obstacle[] = [];
      for (const obstacle of obstaclesRef.current) {
        const y = obstacle.y + speed * dt;
        if (y >= 1.08) {
          continue;
        }
        const next = { ...obstacle, y };
        moved.push(next);
        if (
          !hit &&
          obstacle.lane === laneRef.current &&
          bodiesOverlap(y, spriteSpan, PLAYER_Y, spriteSpan)
        ) {
          hit = next;
        }
      }

      obstaclesRef.current = moved;
      setObstacles(moved);
      if (hit) {
        finish(hit.kind, scoreForTime(elapsedRef.current));
        return;
      }

      setScore(scoreForTime(elapsedRef.current));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, [phase, focused]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        phaseRef.current === 'running' && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (phaseRef.current !== 'running') {
          return;
        }
        const direction = gesture.dx > 36 ? 1 : gesture.dx < -36 ? -1 : 0;
        if (direction === 0) {
          return;
        }
        const next = moveLane(laneRef.current, direction);
        laneRef.current = next;
        setLane(next);
      },
    }),
  ).current;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Late to Class</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        <View style={styles.headerSide}>
          <Text style={styles.best}>Best {best}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Run History"
            onPress={() => router.push('/history' as Href)}
            style={({ pressed }) => [styles.historyButton, pressed && styles.historyButtonPressed]}>
            <Text style={styles.historyLabel}>Run History</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={styles.track}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          trackHeightRef.current = height;
          setTrackHeight(height);
        }}
        {...panResponder.panHandlers}>
        <View style={styles.lanes}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={[styles.lane, index === 1 && styles.middleLane]} />
          ))}
        </View>
        {trackHeight > 0 &&
          (phase === 'running' || phase === 'over') &&
          obstacles.map((obstacle) => (
            <View
              key={obstacle.id}
              style={[
                styles.obstacle,
                {
                  top: obstacle.y * trackHeight,
                  left: `${obstacle.lane * 33.33}%`,
                },
              ]}>
              <Text style={styles.obstacleGlyph}>{obstacle.kind === 'robot' ? '🤖' : '👥'}</Text>
              <Text style={styles.obstacleName}>{obstacle.kind === 'robot' ? 'Robot' : 'Tour'}</Text>
            </View>
          ))}
        {trackHeight > 0 && phase !== 'ready' && (
          <View style={[styles.player, { top: PLAYER_Y * trackHeight, left: `${lane * 33.33}%` }]}>
            <Text style={styles.playerGlyph}>🎒</Text>
            <Text style={styles.playerName}>You</Text>
          </View>
        )}
        {phase === 'ready' && (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>Get to class</Text>
            <Text style={styles.readyCopy}>
              You run on your own. Swipe left or right between three lanes, and dodge delivery robots and tour groups.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {phase === 'ready' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start"
            onPress={beginRun}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
            <Text style={styles.primaryLabel}>Start</Text>
          </Pressable>
        )}
        {phase === 'running' && <Text style={styles.hint}>Swipe the path to change lanes</Text>}
        {phase === 'over' && (
          <View style={styles.overCard}>
            <Text style={styles.overTitle}>You missed class</Text>
            <Text style={styles.overScore}>Score {score}</Text>
            <Text style={styles.overReason}>{reason}</Text>
            {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Play Again"
              onPress={beginRun}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryLabel}>Play Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: campus.ink,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  kicker: {
    color: campus.cream,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  score: {
    color: campus.gold,
    fontSize: 44,
    fontWeight: '800',
  },
  headerSide: {
    alignItems: 'flex-end',
    gap: 8,
  },
  best: {
    color: campus.cream,
    fontSize: 16,
    fontWeight: '700',
  },
  historyButton: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: campus.button,
    borderWidth: 2,
    borderColor: campus.gold,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyButtonPressed: {
    backgroundColor: campus.buttonPressed,
  },
  historyLabel: {
    color: campus.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  track: {
    flex: 1,
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: campus.track,
  },
  lanes: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  lane: {
    flex: 1,
    borderRightWidth: 2,
    borderRightColor: campus.laneLine,
    backgroundColor: campus.lane,
  },
  middleLane: {
    backgroundColor: campus.laneMiddle,
  },
  obstacle: {
    position: 'absolute',
    width: '33.33%',
    alignItems: 'center',
  },
  obstacleGlyph: {
    fontSize: 34,
  },
  obstacleName: {
    color: campus.ink,
    backgroundColor: campus.cream,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 14,
    fontWeight: '800',
  },
  player: {
    position: 'absolute',
    width: '33.33%',
    alignItems: 'center',
  },
  playerGlyph: {
    fontSize: 36,
  },
  playerName: {
    color: campus.ink,
    backgroundColor: campus.gold,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 14,
    fontWeight: '800',
  },
  readyCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '28%',
    backgroundColor: 'rgba(27, 26, 23, 0.94)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: campus.gold,
    padding: 18,
    gap: 8,
  },
  readyTitle: {
    color: campus.gold,
    fontSize: 26,
    fontWeight: '800',
  },
  readyCopy: {
    color: campus.cream,
    fontSize: 17,
    lineHeight: 24,
  },
  footer: {
    minHeight: 132,
    paddingHorizontal: 20,
    paddingBottom: 12,
    justifyContent: 'center',
  },
  hint: {
    color: campus.cream,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
  },
  primaryButton: {
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: campus.cardinal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: campus.cardinalPressed,
  },
  primaryLabel: {
    color: campus.white,
    fontSize: 20,
    fontWeight: '800',
  },
  overCard: {
    backgroundColor: campus.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: campus.gold,
    padding: 16,
    gap: 8,
  },
  overTitle: {
    color: campus.cream,
    fontSize: 22,
    fontWeight: '800',
  },
  overScore: {
    color: campus.gold,
    fontSize: 20,
    fontWeight: '800',
  },
  overReason: {
    color: campus.cream,
    fontSize: 17,
    lineHeight: 24,
  },
  saveError: {
    color: campus.danger,
    fontSize: 16,
    lineHeight: 22,
  },
});
