import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/Home';
import StatsScreen from './src/screens/Stats';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import colors from './src/theme/colors';
import { LanguageProvider } from './src/context/LanguageContext';
import { getHasSeenOnboarding } from './src/services/StorageService';
import ReminderService from './src/services/ReminderService';

const Stack = createNativeStackNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Initialize the reminder service to listen to AppState
    ReminderService.init();

    const checkOnboarding = async () => {
      const hasSeen = await getHasSeenOnboarding();
      if (hasSeen) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Onboarding');
      }
    };
    checkOnboarding();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right'
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

export default App;
