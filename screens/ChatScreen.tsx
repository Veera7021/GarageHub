import { RouteProp, useRoute } from '@react-navigation/native';
import { addDoc, collection, DocumentData, onSnapshot, orderBy, query, QuerySnapshot, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

const ORANGE = '#FF6600';

type RootStackParamList = {
  Chat: { conversationId: string; otherUserId: string; otherUserName: string };
};

type ChatRoute = RouteProp<RootStackParamList, 'Chat'>;

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
};

const ChatScreen: React.FC = () => {
  const { user } = useAuthContext();
  const route = useRoute<ChatRoute>();
  const { conversationId, otherUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const list: Message[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            timestamp: data.timestamp || 0,
          };
        });
        setMessages(list);
        setLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: user.uid,
      text: input.trim(),
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
    });
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={ORANGE} /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.senderId === user?.uid ? styles.bubbleSelf : styles.bubbleOther]}>
              <Text style={item.senderId === user?.uid ? styles.textSelf : styles.textOther}>{item.text}</Text>
              <Text style={styles.timestamp}>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}</Text>
            </View>
          )}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.7}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ORANGE,
    letterSpacing: 1,
  },
  messages: { padding: 16, paddingBottom: 32 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  bubbleSelf: {
    backgroundColor: ORANGE,
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  textSelf: { color: '#fff', fontSize: 16 },
  textOther: { color: '#222', fontSize: 16 },
  timestamp: { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sendButton: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default ChatScreen; 