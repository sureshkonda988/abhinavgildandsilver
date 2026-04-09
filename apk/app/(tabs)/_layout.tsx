import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const GOLD = '#FBBF24';
  const MAGENTA_DARK = '#1A0B2E';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: MAGENTA_DARK,
          borderTopWidth: 1,
          borderTopColor: '#33234d',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: 1,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: 'RATES',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-bar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'VIDEOS',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="play-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
