import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Flame, Users, BarChart2, Settings } from 'lucide-react-native';

import HomeScreen from '../screens/Home';
import CommunityFeedScreen from '../screens/Community/CommunityFeedScreen';
import StatsScreen from '../screens/Stats';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 25,
          paddingTop: 15,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Focus" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Flame color={color} size={28} />
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityFeedScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={28} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={StatsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={28} />
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
