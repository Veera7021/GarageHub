import { collection, doc, DocumentData, getDoc, onSnapshot, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';

type Appointment = {
  id: string;
  service: string;
  car?: { id: string; name: string };
  date: string;
  time: string;
  merchantName?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
};

type Section = {
  title: string;
  data: Appointment[];
};

const statusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'pending': return ORANGE;
    case 'confirmed': return ORANGE;
    case 'completed': return '#2E7D32';
    case 'canceled': return '#D32F2F';
    default: return '#888';
  }
};

const MyAppointmentsScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      async (snapshot: QuerySnapshot<DocumentData>) => {
        const list: Appointment[] = await Promise.all(snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          let merchantName = '';
          if (data.merchantId) {
            try {
              const merchantDocSnap = await getDoc(doc(db, 'users', data.merchantId));
              merchantName = merchantDocSnap.data()?.fullName || '';
            } catch {}
          }
          return {
            id: docSnap.id,
            service: data.service || '',
            car: data.car,
            date: data.date || '',
            time: data.time || '',
            merchantName,
            status: data.status || 'pending',
          };
        }));
        setAppointments(list);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        setError('Failed to load appointments.');
        setLoading(false);
        setRefreshing(false);
      }
    );
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchAppointments();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [fetchAppointments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const sections: Section[] = [
    {
      title: 'Upcoming',
      data: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed'),
    },
    {
      title: 'Completed',
      data: appointments.filter(a => a.status === 'completed'),
    },
    {
      title: 'Canceled',
      data: appointments.filter(a => a.status === 'canceled'),
    },
  ];

  if (loading && !refreshing) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={ORANGE} /></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={{ color: 'red', fontSize: 16 }}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>My Appointments</Text></View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.service}>{item.service || item.car?.name}</Text>
            <Text style={styles.meta}>{item.date} {item.time}</Text>
            <Text style={styles.meta}>Merchant: {item.merchantName || 'N/A'}</Text>
            <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No appointments found.</Text>}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ORANGE,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  service: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  meta: { fontSize: 14, color: '#666', marginBottom: 2 },
  status: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default MyAppointmentsScreen; 