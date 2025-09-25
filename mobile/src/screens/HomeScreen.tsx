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
import { Habit } from '../types/types';

const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await ApiService.getHabits();
      setHabits(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await ApiService.toggleHabitEntry(habitId, today);
      loadHabits(); // Refresh the list
      Alert.alert('Success', 'Habit updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const renderHabitCard = (habit: Habit) => (
    <View key={habit.id} style={styles.habitCard}>
      <View style={styles.habitHeader}>
        <View style={[styles.habitIcon, { backgroundColor: habit.color }]} />
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitDescription}>{habit.description}</Text>
          <Text style={styles.habitStats}>
            Streak: {habit.streak || 0} days • Rate: {habit.completionRate || 0}%
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.checkButton,
          habit.completed ? styles.completedButton : styles.pendingButton,
        ]}
        onPress={() => toggleHabit(habit.id)}
      >
        <Text style={styles.checkButtonText}>
          {habit.completed ? 'Done' : 'Todo'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your habits...</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Your Habits</Text>
        <Text style={styles.subtitle}>
          {habits.filter(h => h.completed).length} of {habits.length} completed today
        </Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No habits yet!</Text>
          <Text style={styles.emptySubtitle}>
            Create your first habit to start building better routines
          </Text>
        </View>
      ) : (
        habits.map(renderHabitCard)
      )}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  habitCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  habitStats: {
    fontSize: 12,
    color: '#10b981',
  },
  checkButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#10b981',
  },
  pendingButton: {
    backgroundColor: '#e5e7eb',
  },
  checkButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;