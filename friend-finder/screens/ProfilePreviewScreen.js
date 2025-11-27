import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import FriendSuggestions from '../components/FriendSuggestions';
import ChatInterface from '../components/ChatInterface';
import ActivityPlanner from '../components/ActivityPlanner';

export default function ProfilePreviewScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user_profile');
        if (raw) setProfile(JSON.parse(raw));
      } catch (err) {
        console.log('Failed loading profile', err);
      }
    })();
  }, []);

  if (!profile) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Ingen profil gemt endnu.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProfileSetup')}>
          <Text style={styles.buttonText}>Opret profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }] }>
      {profile.imageUri ? <Image source={{ uri: profile.imageUri }} style={styles.image} /> : <View style={[styles.placeholder, { backgroundColor: theme.surface }]}><Text style={[styles.placeholderText, { color: theme.muted }]}>No image</Text></View>}
      <Text style={[styles.name, { color: theme.text }]}>{profile.name || 'Ukendt'}</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>{profile.age ? `${profile.age} år` : ''} {profile.gender ? `• ${profile.gender}` : ''}</Text>
      {profile.birthdate && (
        <Text style={[styles.sub, { color: theme.muted }]}>Fødselsdag: {Intl && Intl.DateTimeFormat ? new Intl.DateTimeFormat('da-DK').format(new Date(profile.birthdate)) : profile.birthdate.slice(0,10)}</Text>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Interesser</Text>
        <View style={styles.interestsWrap}>
          {(profile.interests || []).map(i => (
            <View key={i} style={[styles.chip, { backgroundColor: theme.accent }]}><Text style={[styles.chipText, { color: theme.surface }]}>{i}</Text></View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('ProfileSetup')}>
        <Text style={[styles.buttonText, { color: theme.surface }]}>Rediger profil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={async () => {
        await AsyncStorage.removeItem('user_profile');
        setProfile(null);
        navigation.navigate('ProfileSetup');
      }}>
        <Text style={[styles.deleteButtonText, { color: theme.text }]}>Slet gemt profil (test)</Text>
      </TouchableOpacity>
      
      {/* Friend suggestions component (based on shared interests) */}
      <FriendSuggestions />

      {/* Chat interface: messages, send + suggest activity (embedded on same screen) */}
      <ChatInterface />

      {/* Activity planner: suggested activities, date/time options, confirm button (embedded) */}
      <ActivityPlanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0f2e5c', alignItems: 'center', minHeight: '100%' },
  image: { width: 140, height: 140, borderRadius: 70, marginBottom: 12 },
  placeholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  placeholderText: { color: '#ddd' },
  name: { color: 'white', fontSize: 20, fontWeight: '700' },
  sub: { color: '#ddd', marginBottom: 12 },
  section: { width: '100%', marginTop: 10 },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#e19d41', marginRight: 8, marginBottom: 8 },
  chipText: { color: '#012', fontWeight: '700' },
  button: { marginTop: 18, backgroundColor: '#e19d41', padding: 12, borderRadius: 8 },
  buttonText: { color: '#012', fontWeight: '800' },
  deleteButton: { marginTop: 10, backgroundColor: 'transparent', padding: 10 },
  deleteButtonText: { color: '#fff', textDecorationLine: 'underline' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { color: '#ddd', marginBottom: 12 }
});
