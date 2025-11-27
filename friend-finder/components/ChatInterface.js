import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'chat_demo_messages';

const SAMPLE_PARTNER = { id: 'u1', name: 'Mia', age: 24 };

export default function ChatInterface() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setMessages(JSON.parse(raw));
      } catch (e) {
        console.log('load chat', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages]);

  function sendMessage() {
    if (!text.trim()) return;
    const msg = { id: Date.now().toString(), fromMe: true, text: text.trim(), time: new Date().toISOString(), type: 'message' };
    setMessages(prev => [...prev, msg]);
    setText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
  }

  function suggestActivity() {
    Alert.alert('Foreslå aktivitet', 'Vælg aktivitet', [
      { text: 'Kaffe', onPress: () => addProposal('Kaffe') },
      { text: 'Biograftur', onPress: () => addProposal('Biograftur') },
      { text: 'Middag', onPress: () => addProposal('Middag') },
      { text: 'Afbryt', style: 'cancel' }
    ]);
  }

  function addProposal(activity) {
    const msg = { id: Date.now().toString(), fromMe: true, text: activity, time: new Date().toISOString(), type: 'proposal' };
    setMessages(prev => [...prev, msg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
    Alert.alert('Forslag sendt', `Du foreslog: ${activity}`);
  }

  function renderItem({ item }) {
    const containerStyle = [styles.msg, { backgroundColor: item.fromMe ? theme.accent : theme.surface }];
    const textStyle = [styles.msgText, { color: item.fromMe ? theme.surface : theme.text }];
    if (item.type === 'proposal') {
      return (
        <View style={styles.proposalRow}>
          <View style={[styles.proposalBox, { backgroundColor: theme.surface, borderColor: theme.accent }]}> 
            <Text style={{ color: theme.text, fontWeight: '700' }}>Aktivitetsforslag</Text>
            <Text style={{ color: theme.muted, marginTop: 6 }}>{item.text}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: theme.accent }]} onPress={() => Alert.alert('Accept', 'Du accepterede forslaget.') }>
                <Text style={{ color: theme.surface, fontWeight: '700' }}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={() => Alert.alert('Afvis', 'Du afviste forslaget.') }>
                <Text style={{ color: theme.text }}>Afvis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={item.fromMe ? styles.msgRowRight : styles.msgRowLeft}>
        <View style={containerStyle}>
          <Text style={textStyle}>{item.text}</Text>
          <Text style={[styles.time, { color: theme.muted }]}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.surface }]}> 
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.text }]}>Chat med {SAMPLE_PARTNER.name}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>{SAMPLE_PARTNER.age} år</Text>
        </View>

        <FlatList ref={flatRef} data={messages} keyExtractor={m => m.id} renderItem={renderItem} contentContainerStyle={styles.list} />

        <View style={styles.composerRow}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={suggestActivity}>
            <Ionicons name="add-circle-outline" size={28} color={theme.accent} />
          </TouchableOpacity>
          <TextInput value={text} onChangeText={setText} placeholder="Skriv en besked..." placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={sendMessage}>
            <Ionicons name="send" size={20} color={theme.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, borderRadius: 8, marginTop: 12 },
  header: { marginBottom: 8 },
  headerText: { fontWeight: '700', fontSize: 16 },
  list: { paddingBottom: 10 },
  msgRowLeft: { alignItems: 'flex-start', marginBottom: 8 },
  msgRowRight: { alignItems: 'flex-end', marginBottom: 8 },
  msg: { padding: 10, borderRadius: 8, maxWidth: '80%' },
  msgText: { fontSize: 15 },
  time: { marginTop: 6, fontSize: 11, opacity: 0.9 },
  composerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 8 },
  sendBtn: { padding: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { padding: 6, borderRadius: 20 },
  proposalRow: { alignItems: 'center', marginBottom: 8 },
  proposalBox: { padding: 12, borderRadius: 8, borderWidth: 1, width: '100%' },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }
});
