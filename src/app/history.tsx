import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Run History</Text>
      </View>

      {history === null ? (
        <ActivityIndicator color="#F2C14E" style={styles.loader} />
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
    backgroundColor: '#1B1A17',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#3A3128',
  },
  backLabel: {
    color: '#F6E7C1',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#F6E7C1',
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
    backgroundColor: '#C41230',
    borderRadius: 18,
    padding: 20,
  },
  bestLabel: {
    color: '#F6E7C1',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bestScore: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
  },
  error: {
    color: '#F2C14E',
    fontSize: 15,
  },
  empty: {
    color: '#D9CBB2',
    fontSize: 16,
    lineHeight: 22,
  },
  runCard: {
    backgroundColor: '#2A2622',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  runTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  runScore: {
    color: '#F2C14E',
    fontSize: 28,
    fontWeight: '800',
  },
  runWhen: {
    color: '#D9CBB2',
    fontSize: 14,
  },
  runReason: {
    color: '#F6E7C1',
    fontSize: 16,
    lineHeight: 22,
  },
});
