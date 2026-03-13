import { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, FlatList, ActivityIndicator, RefreshControl, Text, Alert,
  ScrollView, Pressable, StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  TrendingUp, Heart, LayoutGrid,
  Monitor, Shirt, ShoppingCart, Home, Sparkles,
  Dumbbell, BookOpen, UtensilsCrossed, Plane,
  Car, CreditCard, Package, MoreHorizontal, Shield,
  Smartphone, Code,
} from 'lucide-react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchCampaigns, Campaign, CampaignFilters } from '../../src/api/campaigns';
import { fetchBrands, fetchCategories, Brand, Category, getCategoryDisplayName, sortCategories } from '../../src/api/brands';
import { fetchFollows } from '../../src/api/follows';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import CampaignCard from '../../src/components/CampaignCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { FilterChip } from '../../src/components/FilterChip';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';

type FeedMode = 'all' | 'following';
type AdItem = { _type: 'ad'; _id: string };
type ListItem = Campaign | AdItem;

const SCREEN_WIDTH = Dimensions.get('window').width;

const SORT_KEYS = ['recommended', 'discount_high', 'has_promo', 'ending_soon', 'last_24h'] as const;

// Category icon & color mapping by slug
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
  'telekomunikasyon':       { icon: Smartphone,          color: '#00CEC9' },
  'teknoloji-yazilim':      { icon: Code,                color: '#A29BFE' },
  'diger':                  { icon: MoreHorizontal,      color: '#9CA3AF' },
};

function getCategoryMeta(slug?: string) {
  if (!slug) return { icon: LayoutGrid, color: Colors.textSecondary };
  return CATEGORY_META[slug] ?? { icon: LayoutGrid, color: Colors.textSecondary };
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const market = useMarketStore((s) => s.market);
  const adFree = useAdFree();

  const [feedMode, setFeedMode] = useState<FeedMode>('all');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState('recommended');

  // FlatList ref — useScrollToTop scrolls to top when active tab is tapped again
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  // ScrollView refs — used to auto-scroll to the selected item
  const categoryScrollRef = useRef<ScrollView>(null);
  const brandScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  const brandPositions = useRef<Record<string, number>>({});

  const { data: brandsData } = useQuery({
    queryKey: ['brands', market],
    queryFn: () => fetchBrands().then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories().then((r) => r.data),
  });

  const { data: followsData } = useQuery({
    queryKey: ['follows'],
    queryFn: () => fetchFollows().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const followedBrandIds = useMemo(() => {
    if (!followsData) return new Set<string>();
    return new Set(followsData.filter((f) => f.brandId).map((f) => f.brandId!));
  }, [followsData]);

  const followedBrandCategoryIds = useMemo(() => {
    if (!brandsData) return new Set<string>();
    return new Set(
      brandsData
        .filter((b: Brand) => followedBrandIds.has(b.id) && b.categoryId)
        .map((b: Brand) => b.categoryId!),
    );
  }, [brandsData, followedBrandIds]);

  const visibleCategories = useMemo(() => {
    let all = categoriesData ?? [];
    if (feedMode === 'following') {
      all = all.filter((c: Category) => followedBrandCategoryIds.has(c.id));
    }
    return sortCategories(all, market);
  }, [categoriesData, feedMode, followedBrandCategoryIds, market]);

  const filteredBrands = useMemo(() => {
    if (!brandsData) return [];
    let list = brandsData;
    if (categoryId) {
      list = list.filter((b: Brand) => b.categoryId === categoryId);
    }
    if (feedMode === 'following') {
      list = list.filter((b: Brand) => followedBrandIds.has(b.id));
    }
    return list;
  }, [brandsData, categoryId, feedMode, followedBrandIds]);

  const handleFeedModeChange = (mode: FeedMode) => {
    setFeedMode(mode);
    setCategoryId(undefined);
    setSelectedBrandIds(new Set());
  };

  const handleCategorySelect = (catId: string | undefined) => {
    const newId = catId === categoryId ? undefined : catId;
    setCategoryId(newId);
    setSelectedBrandIds(new Set());
    // Reset brand scroll when category changes (brand list content changes)
    brandScrollRef.current?.scrollTo({ x: 0, animated: false });
    // Scroll to selected category so it's visible
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
    // Scroll to tapped brand so it's visible
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
    if (brandIdsArray.length > 0) {
      f.brandIds = brandIdsArray;
    } else if (categoryId) {
      f.categoryId = categoryId;
    }
    if (feedMode === 'following') f.followingOnly = true;
    return f;
  }, [brandIdsArray, categoryId, sort, feedMode]);

  // Flat queryKey ensures React Query reliably detects filter changes
  const queryKey = useMemo(
    () => ['campaigns', market, brandIdsArray.join(','), categoryId ?? '', sort, feedMode] as const,
    [market, brandIdsArray, categoryId, sort, feedMode],
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

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if ('_type' in item && item._type === 'ad') {
        return <AdBanner />;
      }
      return <CampaignCard campaign={item} onPress={handleCampaignPress} />;
    },
    [handleCampaignPress],
  );

  // Header is rendered as a React element (not component) so inner ScrollViews
  // keep their scroll position when the FlatList re-renders.
  const headerElement = (
    <View>
      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentTrack}>
          <Pressable
            style={[styles.segmentButton, feedMode === 'all' && styles.segmentButtonActive]}
            onPress={() => handleFeedModeChange('all')}
          >
            <LayoutGrid size={16} color={feedMode === 'all' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.segmentText, feedMode === 'all' && styles.segmentTextActive]}>{t('common.all')}</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, feedMode === 'following' && styles.segmentButtonActive]}
            onPress={() => handleFeedModeChange('following')}
          >
            <Heart size={16} color={feedMode === 'following' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.segmentText, feedMode === 'following' && styles.segmentTextActive]}>{t('home.following')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Following mode description */}
      {feedMode === 'following' && (
        <View style={styles.followingBanner}>
          <Heart size={14} color={Colors.primary} />
          <Text style={styles.followingBannerText}>{t('home.followingDescription')}</Text>
        </View>
      )}

      {/* Categories with Icons */}
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
          {visibleCategories.map((cat: Category) => {
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
          {feedMode === 'following' && filteredBrands.length === 0 && (
            <View style={styles.emptyBrandsHint}>
              <Text style={styles.emptyBrandsHintText}>{t('home.noFollowedBrands')}</Text>
            </View>
          )}
        </ScrollView>
      </View>

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

      {/* Results Count — only when we have data */}
      {!isLoading && (
        <View style={styles.resultsRow}>
          <TrendingUp size={16} color={Colors.primary} />
          <Text style={styles.resultsCount}>
            {t('home.campaignCount', { shown: campaigns.length, total: totalCount })}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('app.name')}</Text>
          <Text style={styles.headerSubtitle}>{t('app.tagline')}</Text>
        </View>
      </View>

      {/* FlatList always mounted — prevents ScrollView unmount & scroll reset */}
      <FlatList
        ref={listRef}
        data={isLoading ? [] : listData}
        renderItem={renderItem}
        keyExtractor={(item) => ('_type' in item ? item._id : item.id)}
        ListHeaderComponent={headerElement}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <TrendingUp size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t('home.noCampaigns')}</Text>
              <Text style={styles.emptyText}>
                {feedMode === 'following'
                  ? t('home.noCampaignsFollowing')
                  : t('home.noCampaignsFilter')}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 1,
  },
  listContent: {
    paddingBottom: TAB_BAR_HEIGHT + 10,
  },
  loading: { paddingVertical: 60, justifyContent: 'center', alignItems: 'center' },
  footerLoader: { paddingVertical: 24 },

  // Segment
  segmentContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 11,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Following banner
  followingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  followingBannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Section label
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Categories with icons
  categoriesSection: {
    marginBottom: 14,
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

  // Brands
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
  emptyBrandsHint: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emptyBrandsHintText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },

  // Sort
  sortSection: {
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
  },

  // Results
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 20,
  },
});
