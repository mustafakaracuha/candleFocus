import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TabNavigator from './src/navigation/TabNavigator';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import SplashScreen from './src/screens/Splash/SplashScreen';
import CreatePostScreen from './src/screens/Community/CreatePostScreen';
import colors from './src/theme/colors';
import { LanguageProvider } from './src/context/LanguageContext';
import { getHasSeenOnboarding } from './src/services/StorageService';
import ReminderService from './src/services/ReminderService';

const Stack = createNativeStackNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Initialize the reminder service to listen to AppState
    ReminderService.init();

    const prepareApp = async () => {
      try {
        // Run both checking onboarding and waiting for splash animation minimum time
        const [hasSeen] = await Promise.all([
          getHasSeenOnboarding(),
          new Promise(resolve => setTimeout(resolve, 2500)) // Force minimum 2.5s splash screen display
        ]);
        
        if (hasSeen) {
          setInitialRoute('MainTabs');
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (e) {
        console.warn(e);
        setInitialRoute('MainTabs'); // Fallback
      } finally {
        setIsAppReady(true);
      }
    };
    
    prepareApp();
  }, []);

  if (!isAppReady || initialRoute === null) {
    return <SplashScreen />;
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
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen} 
              options={{ animation: 'slide_from_bottom' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

export default App;
