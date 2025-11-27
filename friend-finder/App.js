import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ProfilePreviewScreen from './screens/ProfilePreviewScreen';
import FriendSuggestionsScreen from './screens/FriendSuggestionsScreen';
import ChatScreen from './screens/ChatScreen';
import ActivityPlannerScreen from './screens/ActivityPlannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.surface },
      tabBarIcon: ({ color, size }) => {
        let name = 'ios-home';
        if (route.name === 'Suggestions') name = 'people';
        else if (route.name === 'Chat') name = 'chatbubble-ellipses';
        else if (route.name === 'Profile') name = 'person-circle';
        else if (route.name === 'Plans') name = 'calendar';
        return <Ionicons name={name} size={24} color={color} />;
      },
      tabBarActiveTintColor: theme.accent,
      tabBarInactiveTintColor: theme.muted,
    })}>
      <Tab.Screen name="Suggestions" component={FriendSuggestionsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfilePreviewScreen} />
      <Tab.Screen name="Plans" component={ActivityPlannerScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
