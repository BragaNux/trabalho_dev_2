import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventScreen from './screens/EventScreen';
import AttendeesScreen from './screens/AttendeesScreen';
import ScannerScreen from './screens/ScannerScreen';

export type RootStackParamList = {
  Event: undefined;
  Attendees: undefined;
  Scanner: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Event" component={EventScreen} />
          <Stack.Screen name="Attendees" component={AttendeesScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
