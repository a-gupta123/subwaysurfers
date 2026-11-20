import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { campus } from '@/game/colors';
import { History, latestRuns, loadHistory, SavedRun } from '@/game/storage';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<History | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(null);
      loadHistory()
        .then((loaded) => {
          if (active) {
            setHistory(loaded);
          }
        })
        .catch(() => {
          if (active) {
            setError('Run history could not be loaded from this phone.');
            setHistory({ best: 0, runs: [] });
          }
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const runs = history ? latestRuns(history) : [];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Run History</Text>
      </View>

      {history === null ? (
        <ActivityIndicator color={campus.gold} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.bestCard}>
            <Text style={styles.bestLabel}>Best score</Text>
            <Text style={styles.bestScore}>{history.best}</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {runs.length === 0 ? (
            <Text style={styles.empty}>No completed runs yet. Get to class.</Text>
          ) : (
            runs.map((run: SavedRun, index) => (
              <View key={`${run.endedAt}-${index}`} style={styles.runCard}>
                <View style={styles.runTop}>
                  <Text style={styles.runScore}>{run.score}</Text>
                  <Text style={styles.runWhen}>{formatWhen(run.endedAt)}</Text>
                </View>
                <Text style={styles.runReason}>{run.reason}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: campus.ink,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: campus.gold,
    backgroundColor: campus.button,
  },
  backPressed: {
    backgroundColor: campus.buttonPressed,
  },
  backLabel: {
    color: campus.cream,
    fontSize: 17,
    fontWeight: '800',
  },
  title: {
    color: campus.cream,
    fontSize: 32,
    fontWeight: '800',
  },
  loader: {
    marginTop: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  bestCard: {
    backgroundColor: campus.cardinal,
    borderRadius: 18,
    padding: 20,
  },
  bestLabel: {
    color: campus.white,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bestScore: {
    color: campus.white,
    fontSize: 48,
    fontWeight: '800',
  },
  error: {
    color: campus.danger,
    fontSize: 17,
    lineHeight: 24,
  },
  empty: {
    color: campus.cream,
    fontSize: 17,
    lineHeight: 24,
  },
  runCard: {
    backgroundColor: campus.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: campus.gold,
    padding: 16,
    gap: 8,
  },
  runTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  runScore: {
    color: campus.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  runWhen: {
    color: campus.cream,
    fontSize: 16,
    flexShrink: 1,
    textAlign: 'right',
  },
  runReason: {
    color: campus.cream,
    fontSize: 17,
    lineHeight: 24,
  },
});
