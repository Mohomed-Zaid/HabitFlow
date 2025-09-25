import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';

// Import your screens
import HomeScreen from './src/screens/HomeScreen';
import TodayScreen from './src/screens/TodayScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type TabType = 'home' | 'today' | 'progress' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'today':
        return <TodayScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const TabButton = ({ 
    tab, 
    title, 
    emoji 
  }: { 
    tab: TabType; 
    title: string; 
    emoji: string; 
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTab
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabEmoji,
        activeTab === tab && styles.activeTabText
      ]}>
        {emoji}
      </Text>
      <Text style={[
        styles.tabTitle,
        activeTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'home' && 'HabitFlow'}
          {activeTab === 'today' && 'Today'}
          {activeTab === 'progress' && 'Progress'}
          {activeTab === 'profile' && 'Profile'}
        </Text>
      </View>

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton tab="home" title="Home" emoji="H" />
        <TabButton tab="today" title="Today" emoji="T" />
        <TabButton tab="progress" title="Progress" emoji="P" />
        <TabButton tab="profile" title="Profile" emoji="U" />
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  screenContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: '600',
  },
});