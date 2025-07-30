// 📁 Arquivo: App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StackNavigator from './src/navigation/StackNavigator';
import Routes from './src/routes';

export default function App() {
  return (
    // Garante compatibilidade com gestos no Android (obrigatório para navegadores tipo Stack)
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
