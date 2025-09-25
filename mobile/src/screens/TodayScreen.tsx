import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { ApiService } from '../services/ApiService';
import { Habit, AiNudge } from '../types/types';

const TodayScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [aiNudges, setAiNudges] = useState<AiNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const [habitsData, nudgesData] = await Promise.all([
        ApiService.getHabits(),
        ApiService.getAiNudges(),
      ]);
      setHabits(habitsData);
      setAiNudges(nudgesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayData();
    setRefreshing(false);
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await ApiService.toggleHabitEntry(habitId, today);
      loadTodayData(); // Refresh the data
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const dismissNudge = async (nudgeId: string) => {
    try {
      await ApiService.dismissNudge(nudgeId);
      setAiNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss nudge');
    }
  };

  const generateNudge = async () => {
    try {
      await ApiService.generateNudge();
      loadTodayData(); // Refresh to show new nudge
    } catch (error) {
      Alert.alert('Info', 'No new nudges available right now');
    }
  };

  const completedToday = habits.filter(h => h.completed).length;
  const progressPercentage = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;

  const renderAiNudge = (nudge: AiNudge) => (
    <View key={nudge.id} style={styles.nudgeCard}>
      <View style={styles.nudgeHeader}>
        <Text style={styles.nudgeEmoji}>AI</Text>
        <View style={styles.nudgeContent}>
          <Text style={styles.nudgeTitle}>{nudge.title}</Text>
          <Text style={styles.nudgeMessage}>{nudge.message}</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => dismissNudge(nudge.id)}
        >
          <Text style={styles.dismissText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTodayHabit = (habit: Habit) => (
    <TouchableOpacity
      key={habit.id}
      style={[
        styles.todayHabitCard,
        habit.completed ? styles.completedHabit : styles.pendingHabit,
      ]}
      onPress={() => toggleHabit(habit.id)}
    >
      <View style={[styles.habitIcon, { backgroundColor: habit.color }]} />
      <View style={styles.habitDetails}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <Text style={styles.habitCategory}>{habit.category}</Text>
      </View>
      <View style={styles.habitStatus}>
        <Text style={styles.statusText}>
          {habit.completed ? 'Done' : 'Todo'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading today's habits...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Progress Summary */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Today's Progress</Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedToday} of {habits.length} habits completed ({Math.round(progressPercentage)}%)
        </Text>
      </View>

      {/* AI Nudges */}
      {aiNudges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {aiNudges.map(renderAiNudge)}
        </View>
      )}

      {/* Generate Nudge Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.generateButton} onPress={generateNudge}>
          <Text style={styles.generateButtonText}>Get AI Motivation</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Habits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits for today</Text>
          </View>
        ) : (
          habits.map(renderTodayHabit)
        )}
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
  progressCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  nudgeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nudgeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  nudgeContent: {
    flex: 1,
  },
  nudgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  nudgeMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  generateButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  todayHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedHabit: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  pendingHabit: {
    backgroundColor: '#fff',
  },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  habitDetails: {
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
  habitStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default TodayScreen;