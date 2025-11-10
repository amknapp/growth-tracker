import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello Growth Tracker!</Text>
      <Text style={styles.subtext}>If you see this, React is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default TestApp;
