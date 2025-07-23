import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, DocumentData, getDocs, limit, orderBy, query, QueryDocumentSnapshot, startAfter, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase/config';

const ORANGE = '#FF6600';
const PAGE_SIZE = 10;

type Car = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  make?: string;
  model?: string;
  year?: number;
  specs?: string;
  createdAt?: number;
};

type CustomerStackParamList = {
  Marketplace: undefined;
  CarDetail: { car: Car };
};

type SortOption = 'price_asc' | 'price_desc' | 'newest';

const MarketplaceScreen: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const fetchCars = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      let q = collection(db, 'cars');
      let constraints: any[] = [];
      if (search) constraints.push(where('keywords', 'array-contains', search.toLowerCase()));
      if (make) constraints.push(where('make', '==', make));
      if (model) constraints.push(where('model', '==', model));
      if (year) constraints.push(where('year', '==', Number(year)));
      if (minPrice) constraints.push(where('price', '>=', Number(minPrice)));
      if (maxPrice) constraints.push(where('price', '<=', Number(maxPrice)));
      if (sort === 'price_asc') constraints.push(orderBy('price', 'asc'));
      else if (sort === 'price_desc') constraints.push(orderBy('price', 'desc'));
      else constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(PAGE_SIZE));
      if (!reset && lastDoc) constraints.push(startAfter(lastDoc));
      const carQuery = query(q, ...constraints);
      const snap = await getDocs(carQuery);
      const carList: Car[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          price: data.price || 0,
          description: data.description || '',
          imageUrl: data.imageUrl?.[0] || 'https://img.icons8.com/ios-filled/100/000000/car--v2.png',
          make: data.make || '',
          model: data.model || '',
          year: data.year || '',
          specs: data.specs || '',
          createdAt: data.createdAt || 0,
        };
      });
      if (reset) {
        setCars(carList);
      } else {
        setCars(prev => [...prev, ...carList]);
      }
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (e: any) {
      setError('Failed to load car listings.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [search, make, model, year, minPrice, maxPrice, sort, lastDoc]);

  useEffect(() => {
    fetchCars(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, make, model, year, minPrice, maxPrice, sort]);

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchCars();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setLastDoc(null);
    fetchCars(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Make"
          value={make}
          onChangeText={setMake}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Model"
          value={model}
          onChangeText={setModel}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Year"
          value={year}
          onChangeText={setYear}
          placeholderTextColor="#aaa"
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Min Price"
          value={minPrice}
          onChangeText={setMinPrice}
          placeholderTextColor="#aaa"
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Max Price"
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholderTextColor="#aaa"
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
        <View style={styles.sortRow}>
          <TouchableOpacity style={[styles.sortButton, sort === 'newest' && styles.sortButtonActive]} onPress={() => setSort('newest')}>
            <Text style={[styles.sortButtonText, sort === 'newest' && styles.sortButtonTextActive]}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortButton, sort === 'price_asc' && styles.sortButtonActive]} onPress={() => setSort('price_asc')}>
            <Text style={[styles.sortButtonText, sort === 'price_asc' && styles.sortButtonTextActive]}>Price ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortButton, sort === 'price_desc' && styles.sortButtonActive]} onPress={() => setSort('price_desc')}>
            <Text style={[styles.sortButtonText, sort === 'price_desc' && styles.sortButtonTextActive]}>Price ↓</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && !refreshing ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={ORANGE} /></View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: ORANGE, fontSize: 16, marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity onPress={() => fetchCars(true)} style={{ backgroundColor: ORANGE, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }} activeOpacity={0.7}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CarDetail', { car: item })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.carImage} resizeMode="contain" />
              <View style={styles.infoContainer}>
                <Text style={styles.carName}>{item.name}</Text>
                <Text style={styles.carPrice}>${item.price.toLocaleString()}</Text>
                <Text style={styles.carDesc}>{item.description}</Text>
                <Text style={styles.carMeta}>{item.make} {item.model} {item.year}</Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: ORANGE, marginTop: 32, fontWeight: 'bold', fontSize: 16 }}>No cars available.</Text>}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  filterBar: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flexBasis: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  filterInput: {
    flexBasis: '22%',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#222',
    marginBottom: 8,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  sortButton: {
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: ORANGE,
  },
  sortButtonText: {
    color: ORANGE,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  listContent: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  carImage: {
    width: 64,
    height: 64,
    marginRight: 16,
    tintColor: '#222',
  },
  infoContainer: { flex: 1 },
  carName: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  carPrice: { fontSize: 16, color: ORANGE, fontWeight: '600', marginBottom: 2 },
  carDesc: { fontSize: 14, color: '#666' },
  carMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});

export default MarketplaceScreen; 