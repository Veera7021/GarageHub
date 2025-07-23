import { useNavigation } from '@react-navigation/native';
import { collection, DocumentData, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';
const SCREEN_WIDTH = Dimensions.get('window').width;

const quickActions = [
  { key: 'booking', label: 'Book Appointment', icon: '��', screen: 'BookingScreen' },
  { key: 'marketplace', label: 'Marketplace', icon: '🛒', screen: 'MarketplaceScreen' },
  { key: 'rental', label: 'Rental Car', icon: '🚗', screen: 'MarketplaceScreen' },
  { key: 'emergency', label: 'Emergency', icon: '🚨', screen: 'EmergencyScreen' },
  { key: 'driving', label: 'Driving School', icon: '🚦', screen: 'DrivingSchoolScreen' },
  { key: 'more', label: 'See More', icon: '➕', screen: 'MoreScreen' },
];

const initialLayout = { width: SCREEN_WIDTH };

// Appointment type
interface Appointment {
  id: string;
  service: string;
  date: string;
  time: string;
  merchantName?: string;
  status: string;
}

const CustomerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const [search, setSearch] = useState('');
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming Appointments' },
    { key: 'past', title: 'Past Appointments' },
    { key: 'vehicles', title: 'My Vehicles' },
    { key: 'services', title: 'Recent Services' },
  ]);

  // Upcoming appointments state
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingUpcoming(true);
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Appointment[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          service: data.service || '',
          date: data.date || '',
          time: data.time || '',
          merchantName: data.merchantName || '',
          status: data.status || '',
        };
      });
      setUpcoming(list);
      setLoadingUpcoming(false);
    });
    return () => unsub();
  }, [user]);

  const renderQuickAction = ({ item }: any) => (
    <TouchableOpacity
      style={styles.quickAction}
      activeOpacity={0.7}
      onPress={() => navigation.navigate(item.screen as never)}
    >
      <Text style={styles.quickActionIcon}>{item.icon}</Text>
      <Text style={styles.quickActionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  // Tab scenes
  const UpcomingRoute = () => (
    <View style={styles.tabScene}>
      {loadingUpcoming ? (
        <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => (navigation as any).navigate('AppointmentDetails', { id: item.id })}
            >
              <Text style={styles.listItemText}>{item.service} - {item.date} {item.time}</Text>
              <Text style={styles.listItemMeta}>{item.status}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No upcoming appointments.</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  // Placeholder scenes for other tabs
  const PastRoute = () => <View style={styles.tabScene}><Text style={styles.emptyText}>Coming soon</Text></View>;
  const VehiclesRoute = () => <View style={styles.tabScene}><Text style={styles.emptyText}>Coming soon</Text></View>;
  const ServicesRoute = () => <View style={styles.tabScene}><Text style={styles.emptyText}>Coming soon</Text></View>;

  const renderScene = SceneMap({
    upcoming: UpcomingRoute,
    past: PastRoute,
    vehicles: VehiclesRoute,
    services: ServicesRoute,
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#fff"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => (navigation as any).navigate('Services', { query: search })}
        />
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map(action => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickAction}
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate(action.screen)}
          >
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={props => (
          <TabBar
            {...(props as any)}
            indicatorStyle={{ backgroundColor: ORANGE }}
            style={{ backgroundColor: '#fff' }}
            renderLabel={({ route, focused }: any) => (
              <Text style={{ color: focused ? ORANGE : '#888', fontWeight: 'bold', fontSize: 15 }}>{route.title}</Text>
            )}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBarContainer: {
    backgroundColor: ORANGE,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  quickAction: {
    width: (Dimensions.get('window').width - 64) / 3,
    backgroundColor: '#fff5eb',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  quickActionIcon: { fontSize: 28, marginBottom: 6 },
  quickActionLabel: { color: ORANGE, fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  tabScene: { flex: 1, backgroundColor: '#fff' },
  listItem: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItemText: { color: '#222', fontSize: 16, fontWeight: 'bold' },
  listItemMeta: { color: ORANGE, fontSize: 13, marginTop: 4 },
  emptyText: { textAlign: 'center', color: ORANGE, marginTop: 32, fontWeight: 'bold', fontSize: 16 },
});

export default CustomerDashboardScreen; 