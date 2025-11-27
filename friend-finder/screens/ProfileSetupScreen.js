import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const PROFILE_KEY = 'user_profile';

const ALL_INTERESTS = [
  'Musik','Film','Sport','Rejser','Mad','Spil','Kunst','Fotografi','Litteratur','Teknologi',
  'Fitness','Dans','Yoga','Strikning','Havearbejde','Sprog','Frivilligt arbejde','Camping','Klatring'
];

export default function ProfileSetupScreen({ navigation }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(''); // expected YYYY-MM-DD
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setName(p.name || '');
          setBirthdate(p.birthdate || '');
          setGender(p.gender || '');
          setInterests(p.interests || []);
        }
      } catch (e) {
        console.log('load profile', e);
      }
    })();
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleConfirmDate(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth()+1}`.padStart(2,'0');
    const d = `${date.getDate()}`.padStart(2,'0');
    setBirthdate(`${y}-${m}-${d}`);
    setShowDatePicker(false);
  }

  function formattedDateLabel(birth) {
    if (!birth) return 'Vælg dato';
    try {
      return new Intl.DateTimeFormat('da-DK').format(new Date(birth));
    } catch { return birth; }
  }

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  function computeAge(birth) {
    try {
      const parts = birth.split('-').map(Number);
      if (parts.length !== 3) return null;
      const d = new Date(parts[0], parts[1]-1, parts[2]);
      if (isNaN(d)) return null;
      const diff = Date.now() - d.getTime();
      const age = Math.floor(diff / (1000*60*60*24*365.25));
      return age;
    } catch { return null; }
  }

  async function saveProfile() {
    if (!name.trim()) {
      Alert.alert('Validering', 'Navn er påkrævet');
      return;
    }
    const age = computeAge(birthdate);
    if (birthdate && (age === null || age < 0 || age > 120)) {
      Alert.alert('Validering', 'Indtast en gyldig fødselsdato i formatet YYYY-MM-DD');
      return;
    }

    const profile = { name: name.trim(), birthdate: birthdate || null, age: age || null, gender: gender || null, interests };
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      Alert.alert('Gemte', 'Profil gemt');
      navigation.navigate('ProfilePreview');
    } catch (e) {
      console.log('save profile', e);
      Alert.alert('Fejl', 'Kunne ikke gemme profilen');
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={[styles.title, { color: theme.text }]}>Opret / Rediger din profil</Text>

      <Text style={[styles.label, { color: theme.text }]}>Navn</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Dit navn" style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]} />

      <Text style={[styles.label, { color: theme.text }]}>Fødselsdato</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { backgroundColor: theme.surface, justifyContent: 'center' }] }>
        <Text style={{ color: birthdate ? theme.text : theme.muted }}>{formattedDateLabel(birthdate)}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        maximumDate={new Date()}
        onConfirm={handleConfirmDate}
        onCancel={() => setShowDatePicker(false)}
      />

      <Text style={[styles.label, { color: theme.text }]}>Køn</Text>
      <View style={styles.row}>
        {['Mand','Kvinde','Andet'].map(g => (
          <TouchableOpacity key={g} onPress={() => setGender(g)} style={[styles.pill, { backgroundColor: gender===g ? theme.accent : theme.surface }]}>
            <Text style={{ color: gender===g ? theme.surface : theme.text }}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Interesser</Text>
      <View style={styles.rowWrap}>
        {ALL_INTERESTS.map(i => (
          <TouchableOpacity key={i} onPress={() => toggleInterest(i)} style={[styles.chip, { backgroundColor: interests.includes(i) ? theme.accent : theme.surface }]}>
            <Text style={{ color: interests.includes(i) ? theme.surface : theme.text }}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={saveProfile}>
        <Text style={{ color: theme.surface, fontWeight: '700' }}>Gem profil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, minHeight: '100%' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '700' },
  input: { padding: 10, borderRadius: 8 },
  row: { flexDirection: 'row', gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  saveBtn: { marginTop: 20, padding: 12, borderRadius: 8, alignItems: 'center' }
});

