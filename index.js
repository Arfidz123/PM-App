/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import React from 'react';
import { AppRegistry, View, Text, ScrollView, StyleSheet } from 'react-native';
import { name as appName } from './app.json';

let RootComponent;
let startupError = null;

try {
  const App = require('./App').default;
  RootComponent = App;
} catch (error) {
  startupError = error;
  console.error('Fatal startup error loading App:', error);

  RootComponent = function StartupErrorFallback() {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>Startup Error</Text>
        <Text style={errorStyles.subtitle}>
          Terjadi kesalahan saat memuat modul aplikasi:
        </Text>
        <ScrollView style={errorStyles.box}>
          <Text style={errorStyles.errorText}>
            {String(startupError?.stack || startupError?.message || startupError)}
          </Text>
        </ScrollView>
      </View>
    );
  };
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  box: {
    maxHeight: 350,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorText: {
    color: '#f8fafc',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

AppRegistry.registerComponent(appName, () => RootComponent);

