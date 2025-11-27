import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const PLANS_KEY = 'activity_plans';

function makeDateOptions(days = 5) {
  const slots = ['18:00', '19:00', '20:00'];
  const opts = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    const label = d === 0 ? 'I dag' : d === 1 ? 'I morgen' : day.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' });
    slots.forEach(slot => {
      opts.push({ id: `${d}-${slot}`, date: new Date(day.toDateString() + ' ' + slot), label: `${label} ${slot}` });
    });
  }
  return opts;
}

export default function ActivityPlanner() {
  const { theme } = useTheme();
  const [activities] = useState(['Kaffe', 'Biograftur', 'Middag', 'Gåtur', 'Brætspil']);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [dateOptions] = useState(() => makeDateOptions(5));
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {}, []);

  const confirmPlan = async () => {
    if (!selectedActivity || !selectedDateId) {
      Alert.alert('Vælg aktivitet og tidspunkt', 'Du skal vælge både en aktivitet og et tidspunkt før du kan bekræfte.');
      return;
    }
    const chosen = dateOptions.find(d => d.id === selectedDateId);
    const plan = { id: Date.now().toString(), activity: selectedActivity, time: chosen.date.toISOString(), label: chosen.label, createdAt: new Date().toISOString() };
    try {
      const raw = await AsyncStorage.getItem(PLANS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(PLANS_KEY, JSON.stringify([...list, plan]));
      Alert.alert('Plan bekræftet', `Aktivitet: ${plan.activity}\nTid: ${plan.label}`);
      setSelectedActivity(null);
      setSelectedDateId(null);
    } catch (e) {
      console.log('Failed saving plan', e);
      Alert.alert('Fejl', 'Kunne ikke gemme planen');
    }
  };

  function renderActivity({ item }) {
    const selected = item === selectedActivity;
    return (
      <TouchableOpacity onPress={() => setSelectedActivity(item)} style={[styles.activityBtn, { borderColor: selected ? theme.accent : 'transparent', backgroundColor: selected ? theme.accent : theme.surface }] }>
        <Ionicons name="calendar" size={16} color={selected ? theme.surface : theme.text} style={{ marginRight: 8 }} />
        <Text style={{ color: selected ? theme.surface : theme.text, fontWeight: '700' }}>{item}</Text>
      </TouchableOpacity>
    );
  }

  function renderDate({ item }) {
    const selected = item.id === selectedDateId;
    return (
      <TouchableOpacity onPress={() => setSelectedDateId(item.id)} style={[styles.dateBtn, { borderColor: selected ? theme.accent : 'transparent', backgroundColor: selected ? theme.accent : theme.background }]}>
        <Text style={{ color: selected ? theme.surface : theme.text }}>{item.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Activity Planner</Text>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>Foreslåede aktiviteter</Text>
      <FlatList data={activities} keyExtractor={a => a} renderItem={renderActivity} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} />

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>Vælg dato og tid</Text>
      <FlatList data={dateOptions} keyExtractor={d => d.id} renderItem={renderDate} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} />

      <TouchableOpacity disabled={!selectedActivity || !selectedDateId} onPress={confirmPlan} style={[styles.confirmBtn, { backgroundColor: (!selectedActivity || !selectedDateId) ? theme.muted : theme.accent }]}>
        <Text style={{ color: theme.surface, fontWeight: '800' }}>Bekræft plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', padding: 12, borderRadius: 8, marginTop: 12 },
  title: { fontWeight: '800', fontSize: 16, marginBottom: 6 },
  sectionTitle: { fontSize: 13, marginBottom: 8 },
  activityBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, marginRight: 8, borderWidth: 1 },
  dateBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1 },
  confirmBtn: { padding: 12, alignItems: 'center', borderRadius: 8 }
});
