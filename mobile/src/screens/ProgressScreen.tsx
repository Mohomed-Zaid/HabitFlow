import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { ApiService } from '../services/ApiService';
import { Habit, UserStats } from '../types/types';

const { width: screenWidth } = Dimensions.get('window');

const ProgressScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [habitsData, statsData] = await Promise.all([
        ApiService.getHabits(),
        ApiService.getUserStats(),
      ]);
      setHabits(habitsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const renderStatsCard = (title: string, value: number, subtitle: string, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={styles.statsSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderHabitProgress = (habit: Habit) => {
    const completionRate = habit.completionRate || 0;
    
    return (
      <View key={habit.id} style={styles.habitProgressCard}>
        <View style={styles.habitHeader}>
          <View style={[styles.habitIcon, { backgroundColor: habit.color }]} />
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitCategory}>{habit.category}</Text>
          </View>
          <View style={styles.habitScore}>
            <Text style={styles.scoreText}>{completionRate}%</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: `${completionRate}%`,
                  backgroundColor: completionRate > 80 ? '#10b981' : completionRate > 50 ? '#f59e0b' : '#ef4444'
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.habitStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Streak: {habit.streak || 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Done: {Math.round((completionRate / 100) * 30)}</Text>
            <Text style={styles.statLabel}>Completed Days</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const overallProgress = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + (h.completionRate || 0), 0) / habits.length)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall Progress */}
      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Progress</Text>
        <View style={styles.circularProgress}>
          <Text style={styles.progressPercentage}>{overallProgress}%</Text>
          <Text style={styles.progressLabel}>Average Completion</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {renderStatsCard(
          'Total Habits',
          stats?.totalHabits || habits.length,
          'Active habits',
          '#10b981'
        )}
        {renderStatsCard(
          'Longest Streak',
          stats?.longestStreak || Math.max(...habits.map(h => h.streak || 0), 0),
          'Best performance',
          '#f59e0b'
        )}
        {renderStatsCard(
          'Total Completions',
          stats?.totalCompletions || 0,
          'All time',
          '#8b5cf6'
        )}
        {renderStatsCard(
          'Current Streak',
          stats?.currentStreak || 0,
          'Keep it going!',
          '#ef4444'
        )}
      </View>

      {/* Individual Habit Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habit Details</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No habits to track</Text>
            <Text style={styles.emptySubtitle}>Create some habits to see your progress here!</Text>
          </View>
        ) : (
          habits.map(renderHabitProgress)
        )}
      </View>

      {/* Insights Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Performance Analysis</Text>
          {overallProgress >= 80 && (
            <Text style={styles.insightText}>
              Amazing! You're crushing your habits with {overallProgress}% completion rate.
            </Text>
          )}
          {overallProgress >= 50 && overallProgress < 80 && (
            <Text style={styles.insightText}>
              Great progress! You're building solid habits with {overallProgress}% completion. 
              Keep pushing to reach 80%!
            </Text>
          )}
          {overallProgress < 50 && (
            <Text style={styles.insightText}>
              You're on your journey! Focus on 1-2 habits to build momentum, then expand gradually.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  overallCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  circularProgress: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#fff',
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  habitProgressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  habitCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  habitScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default ProgressScreen;