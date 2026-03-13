import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, TextInput, FlatList, ActivityIndicator, RefreshControl,
  Text, StyleSheet, Pressable, Keyboard, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Search, X, LayoutGrid, SlidersHorizontal,
  Monitor, Shirt, ShoppingCart, Home, Sparkles,
  Dumbbell, BookOpen, UtensilsCrossed, Plane,
  Car, CreditCard, Package, MoreHorizontal, Shield,
} from 'lucide-react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchCampaigns, Campaign, CampaignFilters } from '../../src/api/campaigns';
import { fetchBrands, fetchCategories, Brand, Category, getCategoryDisplayName, sortCategories } from '../../src/api/brands';
import CampaignCard from '../../src/components/CampaignCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { FilterChip } from '../../src/components/FilterChip';
import { useMarketStore } from '../../src/store/market';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';

type AdItem = { _type: 'ad'; _id: string };
type ListItem = Campaign | AdItem;

const SCREEN_WIDTH = Dimensions.get('window').width;

const SORT_KEYS = ['recommended', 'discount_high', 'has_promo', 'ending_soon', 'last_24h'] as const;

const CATEGORY_META: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  'elektronik':             { icon: Monitor,            color: '#4A90D9' },
  'giyim-moda':             { icon: Shirt,              color: '#E8553A' },
  'gida-market':            { icon: ShoppingCart,        color: '#2ED573' },
  'ev-yasam':               { icon: Home,               color: '#FF9F43' },
  'kozmetik-kisisel-bakim': { icon: Sparkles,            color: '#FF6B81' },
  'spor-outdoor':           { icon: Dumbbell,            color: '#7C5CFC' },
  'kitap-hobi':             { icon: BookOpen,            color: '#17A2B8' },
  'seyahat-ulasim':         { icon: Plane,              color: '#0ABDE3' },
  'yeme-icme':              { icon: UtensilsCrossed,     color: '#FD7E14' },
  'otomobil':               { icon: Car,                color: '#636E72' },
  'finans':                 { icon: CreditCard,          color: '#6C5CE7' },
  'alisveris':              { icon: Package,            color: '#00B894' },
  'sigorta':                { icon: Shield,              color: '#2C7A7B' },
  'diger':                  { icon: MoreHorizontal,      color: '#9CA3AF' },
};

function getCategoryMeta(slug?: string) {
  if (!slug) return { icon: LayoutGrid, color: Colors.textSecondary };
  return CATEGORY_META[slug] ?? { icon: LayoutGrid, color: Colors.textSecondary };
}

export default function SearchScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const market = useMarketStore((s) => s.market);
  const adFree = useAdFree();
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sort, setSort] = useState('recommended');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());
  const [filtersVisible, setFiltersVisible] = useState(false);

  const activeFilterCount = (categoryId ? 1 : 0) + (selectedBrandIds.size > 0 ? 1 : 0);

  const toggleFilters = () => {
    setFiltersVisible((v) => !v);
  };

  const categoryScrollRef = useRef<ScrollView>(null);
  const brandScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  const brandPositions = useRef<Record<string, number>>({});

  const { data: brandsData } = useQuery({
    queryKey: ['brands', market],
    queryFn: () => fetchBrands().then((r) => r.data),
  });

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories().then((r) => r.data),
  });

  const categoriesData = useMemo(
    () => sortCategories(categoriesRaw ?? [], market),
    [categoriesRaw, market],
  );

  const filteredBrands = useMemo(() => {
    if (!brandsData) return [];
    if (categoryId) {
      return brandsData.filter((b: Brand) => b.categoryId === categoryId);
    }
    return brandsData;
  }, [brandsData, categoryId]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(text.trim());
    }, 400);
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const handleCategorySelect = (catId: string | undefined) => {
    const newId = catId === categoryId ? undefined : catId;
    setCategoryId(newId);
    setSelectedBrandIds(new Set());
    brandScrollRef.current?.scrollTo({ x: 0, animated: false });
    if (newId && categoryPositions.current[newId] !== undefined) {
      const targetX = categoryPositions.current[newId];
      const scrollX = Math.max(0, targetX - SCREEN_WIDTH / 2 + 45);
      setTimeout(() => {
        categoryScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 50);
    } else if (!newId) {
      setTimeout(() => {
        categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
      }, 50);
    }
  };

  const handleBrandSelect = (bId: string | undefined) => {
    if (!bId) {
      // "Tümü" tapped — clear all selections
      setSelectedBrandIds(new Set());
      brandScrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    setSelectedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(bId)) {
        next.delete(bId);
      } else {
        next.add(bId);
      }
      return next;
    });
    if (brandPositions.current[bId] !== undefined) {
      const targetX = brandPositions.current[bId];
      const scrollX = Math.max(0, targetX - SCREEN_WIDTH / 2 + 45);
      setTimeout(() => {
        brandScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 50);
    }
  };

  const brandIdsArray = useMemo(() => Array.from(selectedBrandIds), [selectedBrandIds]);

  const filters = useMemo<CampaignFilters>(() => {
    const f: CampaignFilters = {
      sort: sort as any,
      limit: 15,
    };
    if (debouncedQuery.length >= 2) f.search = debouncedQuery;
    if (brandIdsArray.length > 0) {
      f.brandIds = brandIdsArray;
    } else if (categoryId) {
      f.categoryId = categoryId;
    }
    return f;
  }, [brandIdsArray, categoryId, sort, debouncedQuery]);

  const queryKey = useMemo(
    () => ['search-campaigns', market, brandIdsArray.join(','), categoryId ?? '', sort, debouncedQuery] as const,
    [market, brandIdsArray, categoryId, sort, debouncedQuery],
  );

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage,
    isLoading, refetch, isRefetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchCampaigns({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
  });

  const campaigns = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.data) ?? [];
    const seen = new Set<string>();
    return all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);
  const totalCount = data?.pages[0]?.meta?.total ?? 0;

  const listData: ListItem[] = useMemo(() => {
    if (adFree) return campaigns;
    const result: ListItem[] = [];
    campaigns.forEach((c, i) => {
      result.push(c);
      if ((i + 1) % AD_INTERVAL === 0) {
        result.push({ _type: 'ad', _id: `ad-${i}` });
      }
    });
    return result;
  }, [campaigns, adFree]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCampaignPress = useCallback((campaign: Campaign) => {
    router.push(`/campaign/${campaign.id}`);
  }, [router]);

  const headerElement = (
    <View>
      {/* Categories & Brands (toggled by filter icon) */}
      {filtersVisible && (
        <View>
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionLabel}>{t('common.categories')}</Text>
            <ScrollView
              ref={categoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            >
              <Pressable
                style={[styles.categoryCard, !categoryId && styles.categoryCardActive]}
                onPress={() => handleCategorySelect(undefined)}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: !categoryId ? '#fff' : Colors.primary + '15' }]}>
                  <LayoutGrid size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.categoryCardText, !categoryId && styles.categoryCardTextActive]}>{t('common.all')}</Text>
              </Pressable>
              {(categoriesData ?? []).map((cat: Category) => {
                const meta = getCategoryMeta(cat.slug);
                const isActive = categoryId === cat.id;
                const IconComp = meta.icon;
                return (
                  <View
                    key={cat.id}
                    onLayout={(e) => {
                      categoryPositions.current[cat.id] = e.nativeEvent.layout.x;
                    }}
                  >
                    <Pressable
                      style={[styles.categoryCard, isActive && { backgroundColor: meta.color, borderColor: meta.color }]}
                      onPress={() => handleCategorySelect(cat.id)}
                    >
                      <View style={[styles.categoryIconCircle, { backgroundColor: isActive ? '#fff' : meta.color + '18' }]}>
                        <IconComp size={18} color={meta.color} />
                      </View>
                      <Text style={[styles.categoryCardText, isActive && styles.categoryCardTextActive]} numberOfLines={1}>
                        {getCategoryDisplayName(cat, market)}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Brands (multi-select) */}
          <View style={styles.brandsSection}>
            <Text style={styles.sectionLabel}>
              {t('common.brands')}{selectedBrandIds.size > 0 ? ` (${selectedBrandIds.size})` : ''}
            </Text>
            <ScrollView
              ref={brandScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsList}
            >
              <Pressable
                style={[styles.brandChip, selectedBrandIds.size === 0 && styles.brandChipActive]}
                onPress={() => handleBrandSelect(undefined)}
              >
                <Text style={[styles.brandChipText, selectedBrandIds.size === 0 && styles.brandChipTextActive]}>{t('common.all')}</Text>
              </Pressable>
              {filteredBrands.map((brand: Brand) => {
                const isSelected = selectedBrandIds.has(brand.id);
                return (
                  <View
                    key={brand.id}
                    onLayout={(e) => {
                      brandPositions.current[brand.id] = e.nativeEvent.layout.x;
                    }}
                  >
                    <Pressable
                      style={[styles.brandChip, isSelected && styles.brandChipActive]}
                      onPress={() => handleBrandSelect(brand.id)}
                    >
                      <Text
                        style={[styles.brandChipText, isSelected && styles.brandChipTextActive]}
                        numberOfLines={1}
                      >
                        {brand.name}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          {SORT_KEYS.map((key) => (
            <FilterChip
              key={key}
              label={t(`sort.${key}`)}
              selected={sort === key}
              onPress={() => setSort(key)}
              color={Colors.accent}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      {!isLoading && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>{t('search.resultCount', { shown: campaigns.length, total: totalCount })}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.explore')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 ? (
            <Pressable onPress={clearSearch} hitSlop={8}>
              <X size={16} color={Colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={[styles.filterToggle, filtersVisible && styles.filterToggleActive]}
          onPress={toggleFilters}
        >
          <SlidersHorizontal size={20} color={filtersVisible ? '#fff' : Colors.text} />
          {activeFilterCount > 0 && !filtersVisible && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={isLoading ? [] : listData}
        renderItem={({ item }: { item: ListItem }) => {
          if ('_type' in item && item._type === 'ad') {
            return <AdBanner />;
          }
          return <CampaignCard campaign={item} onPress={handleCampaignPress} />;
        }}
        keyExtractor={(item) => ('_type' in item ? item._id : item.id)}
        ListHeaderComponent={headerElement}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={Colors.primary} style={{ padding: 24 }} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Search size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t('search.noResults')}</Text>
              <Text style={styles.emptyText}>{t('search.noResultsHint')}</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterToggle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoriesSection: {
    marginBottom: 14,
    marginTop: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    minWidth: 80,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 6,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  categoryCardTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  brandsSection: {
    marginBottom: 12,
  },
  brandsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  brandChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  brandChipTextActive: {
    color: '#fff',
  },
  sortSection: {
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  resultsRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: TAB_BAR_HEIGHT + 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
