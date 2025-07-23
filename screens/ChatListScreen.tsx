import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, DocumentData, onSnapshot, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

const ORANGE = '#FF6600';

type Conversation = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: number;
  otherUserName: string;
  otherUserId: string;
};

type RootStackParamList = {
  Chat: { conversationId: string; otherUserId: string; otherUserName: string };
};

const ChatListScreen: React.FC = () => {
  const { user } = useAuthContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastTimestamp', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const list: Conversation[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const otherUserId = (data.participants as string[]).find((id) => id !== user.uid) || '';
          return {
            id: doc.id,
            participants: data.participants,
            lastMessage: data.lastMessage || '',
            lastTimestamp: data.lastTimestamp || 0,
            otherUserName: data.otherUserName || 'User',
            otherUserId,
          };
        });
        setConversations(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load conversations.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUserId: item.otherUserId, otherUserName: item.otherUserName })}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.otherUserName}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              <Text style={styles.timestamp}>{item.lastTimestamp ? new Date(item.lastTimestamp).toLocaleString() : ''}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No conversations found.</Text>}
      />
    </View>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: ORANGE,
    letterSpacing: 1,
  },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoContainer: {},
  name: { fontSize: 18, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
  lastMessage: { fontSize: 15, color: '#222', marginBottom: 2 },
  timestamp: { fontSize: 13, color: '#888' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default ChatListScreen; 