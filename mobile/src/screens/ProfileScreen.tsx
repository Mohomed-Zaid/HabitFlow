import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { ApiService } from '../services/ApiService';
import { UserStats } from '../types/types';

const ProfileScreen = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const statsData = await ApiService.getUserStats();
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const generateMotivation = async () => {
    try {
      await ApiService.generateMotivation();
      Alert.alert('Success', 'Check your Today tab for new motivation!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate motivation');
    }
  };

  const requestAiNudge = async () => {
    try {
      await ApiService.requestAiNudge();
      Alert.alert('Success', 'AI insight generated! Check your Today tab.');
    } catch (error) {
      Alert.alert('Info', 'No new insights available right now');
    }
  };

  const shareApp = async () => {
    const appUrl = 'https://habitflow-app.com'; // Replace with your actual app URL
    const message = `Check out HabitFlow - the AI-powered habit tracker that's helping me build better routines! ${appUrl}`;
    
    try {
      // You would use a sharing library like react-native-share here
      Alert.alert(
        'Share HabitFlow',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy Link', onPress: () => {
            // In a real app, you'd copy to clipboard
            Alert.alert('Success', 'Link copied to clipboard!');
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share app');
    }
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@habitflow-app.com?subject=HabitFlow Support');
  };

  const renderProfileOption = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = '#10b981'
  ) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      <View style={[styles.optionIcon, { backgroundColor: color }]}>
        <Text style={styles.optionEmoji}>{icon}</Text>
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>&gt;</Text>
    </TouchableOpacity>
  );

  const renderStatCard = (title: string, value: number, subtitle: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const memberSince = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>H</Text>
        </View>
        <Text style={styles.userName}>HabitFlow User</Text>
        <Text style={styles.memberSince}>Member since {memberSince}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Journey</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Active Habits',
            stats?.activeHabits || 0,
            'Currently tracking'
          )}
          {renderStatCard(
            'Longest Streak',
            stats?.longestStreak || 0,
            'Best performance'
          )}
          {renderStatCard(
            'Total Completions',
            stats?.totalCompletions || 0,
            'All time achievements'
          )}
        </View>
      </View>

      {/* AI Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Features</Text>
        {renderProfileOption(
          'AI',
          'Get AI Motivation',
          'Generate personalized motivational message',
          generateMotivation,
          '#8b5cf6'
        )}
        {renderProfileOption(
          'TIP',
          'Request AI Insight',
          'Get smart habit recommendations',
          requestAiNudge,
          '#f59e0b'
        )}
      </View>

      {/* App Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        {renderProfileOption(
          'CHART',
          'View All Habits',
          'Manage your habit collection',
          () => Alert.alert('Info', 'Go to Home tab to manage habits'),
          '#10b981'
        )}
        {renderProfileOption(
          '📈',
          'Progress Analytics',
          'Detailed insights and charts',
          () => Alert.alert('Info', 'Check the Progress tab for analytics'),
          '#3b82f6'
        )}
      </View>

      {/* Support & Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Sharing</Text>
        {renderProfileOption(
          '📤',
          'Share HabitFlow',
          'Tell friends about the app',
          shareApp,
          '#ef4444'
        )}
        {renderProfileOption(
          '💬',
          'Contact Support',
          'Get help or provide feedback',
          openSupport,
          '#6b7280'
        )}
      </View>

      {/* App Info */}
      <View style={styles.appInfoCard}>
        <Text style={styles.appName}>HabitFlow</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appDescription}>
          AI-powered habit tracking for building lasting positive routines
        </Text>
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
  headerCard: {
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  appInfoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileScreen;