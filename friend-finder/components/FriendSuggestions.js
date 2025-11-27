import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function FriendSuggestions() {
  const { theme } = useTheme();
  const sample = [
    { id: '1', name: 'Mia', mutual: 3 },
    { id: '2', name: 'Jonas', mutual: 2 }
  ];
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Forslag til venner</Text>
      {sample.map(s => (
        <View key={s.id} style={styles.row}>
          <Text style={{ color: theme.text }}>{s.name} — {s.mutual} fælles</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={() => {}}>
            <Text style={{ color: theme.surface }}>Se</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', padding: 12, borderRadius: 8, marginTop: 12 },
  title: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }
});
