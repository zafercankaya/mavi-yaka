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
import { fetchJobs, JobListing, JobFilters } from '../../src/api/jobs';
import { fetchCompanies, Company } from '../../src/api/companies';
import { fetchFollows } from '../../src/api/follows';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import JobCard from '../../src/components/JobCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { FilterChip } from '../../src/components/FilterChip';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';

type FeedMode = 'all' | 'following';
type AdItem = { _type: 'ad'; _id: string };
type ListItem = JobListing | AdItem;

const SCREEN_WIDTH = Dimensions.get('window').width;

const SORT_KEYS = ['recommended', 'newest', 'ending_soon', 'last_24h'] as const;

// Category icon & color mapping by slug
const SECTOR_META: Record<string, { icon: React.ComponentType<any>; color: string }> = {
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

function getSectorMeta(slug?: string) {
  if (!slug) return { icon: LayoutGrid, color: Colors.textSecondary };
  return SECTOR_META[slug] ?? { icon: LayoutGrid, color: Colors.textSecondary };
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
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState('recommended');

  // FlatList ref — useScrollToTop scrolls to top when active tab is tapped again
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  // ScrollView refs — used to auto-scroll to the selected item
  const categoryScrollRef = useRef<ScrollView>(null);
  const companyScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  const companyPositions = useRef<Record<string, number>>({});

  const { data: companiesData } = useQuery({
    queryKey: ['companies', market],
    queryFn: () => fetchCompanies().then((r) => r.data),
  });

  const { data: followsData } = useQuery({
    queryKey: ['follows'],
    queryFn: () => fetchFollows().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const followedCompanyIds = useMemo(() => {
    if (!followsData) return new Set<string>();
    return new Set(followsData.filter((f) => f.companyId).map((f) => f.companyId!));
  }, [followsData]);

  const filteredCompanies = useMemo(() => {
    if (!companiesData) return [];
    let list = companiesData;
    if (categoryId) {
      list = list.filter((c: Company) => c.sector === categoryId);
    }
    if (feedMode === 'following') {
      list = list.filter((c: Company) => followedCompanyIds.has(c.id));
    }
    return list;
  }, [companiesData, categoryId, feedMode, followedCompanyIds]);

  const handleFeedModeChange = (mode: FeedMode) => {
    setFeedMode(mode);
    setCategoryId(undefined);
    setSelectedCompanyIds(new Set());
  };

  const handleCategorySelect = (catId: string | undefined) => {
    const newId = catId === categoryId ? undefined : catId;
    setCategoryId(newId);
    setSelectedCompanyIds(new Set());
    // Reset company scroll when category changes (company list content changes)
    companyScrollRef.current?.scrollTo({ x: 0, animated: false });
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

  const handleCompanySelect = (bId: string | undefined) => {
    if (!bId) {
      // "Tümü" tapped — clear all selections
      setSelectedCompanyIds(new Set());
      companyScrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(bId)) {
        next.delete(bId);
      } else {
        next.add(bId);
      }
      return next;
    });
    // Scroll to tapped company so it's visible
    if (companyPositions.current[bId] !== undefined) {
      const targetX = companyPositions.current[bId];
      const scrollX = Math.max(0, targetX - SCREEN_WIDTH / 2 + 45);
      setTimeout(() => {
        companyScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 50);
    }
  };

  const companyIdsArray = useMemo(() => Array.from(selectedCompanyIds), [selectedCompanyIds]);

  const filters = useMemo<JobFilters>(() => {
    const f: JobFilters = {
      sort: sort as any,
      limit: 15,
    };
    if (companyIdsArray.length > 0) {
      f.companyIds = companyIdsArray;
    } else if (categoryId) {
      f.sector = categoryId;
    }
    if (feedMode === 'following') f.followingOnly = true;
    return f;
  }, [companyIdsArray, categoryId, sort, feedMode]);

  // Flat queryKey ensures React Query reliably detects filter changes
  const queryKey = useMemo(
    () => ['jobs', market, companyIdsArray.join(','), categoryId ?? '', sort, feedMode] as const,
    [market, companyIdsArray, categoryId, sort, feedMode],
  );

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage,
    isLoading, refetch, isRefetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchJobs({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
  });

  const jobs = useMemo(() => {
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
    if (adFree) return jobs;
    const result: ListItem[] = [];
    jobs.forEach((c, i) => {
      result.push(c);
      if ((i + 1) % AD_INTERVAL === 0) {
        result.push({ _type: 'ad', _id: `ad-${i}` });
      }
    });
    return result;
  }, [jobs, adFree]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleJobPress = useCallback((job: JobListing) => {
    router.push(`/job/${job.id}`);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if ('_type' in item && item._type === 'ad') {
        return <AdBanner />;
      }
      return <JobCard job={item as JobListing} onPress={handleJobPress} />;
    },
    [handleJobPress],
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

      {/* Sectors with Icons */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionLabel}>{t('common.sectors')}</Text>
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
          {Object.entries(SECTOR_META).map(([slug, meta]) => {
            const isActive = categoryId === slug;
            const IconComp = meta.icon;
            return (
              <View
                key={slug}
                onLayout={(e) => {
                  categoryPositions.current[slug] = e.nativeEvent.layout.x;
                }}
              >
                <Pressable
                  style={[styles.categoryCard, isActive && { backgroundColor: meta.color, borderColor: meta.color }]}
                  onPress={() => handleCategorySelect(slug)}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: isActive ? '#fff' : meta.color + '18' }]}>
                    <IconComp size={18} color={meta.color} />
                  </View>
                  <Text style={[styles.categoryCardText, isActive && styles.categoryCardTextActive]} numberOfLines={1}>
                    {t(`sectors.${slug}`, slug)}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Companies (multi-select) */}
      <View style={styles.companiesSection}>
        <Text style={styles.sectionLabel}>
          {t('common.companies')}{selectedCompanyIds.size > 0 ? ` (${selectedCompanyIds.size})` : ''}
        </Text>
        <ScrollView
          ref={companyScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.companiesList}
        >
          <Pressable
            style={[styles.companyChip, selectedCompanyIds.size === 0 && styles.companyChipActive]}
            onPress={() => handleCompanySelect(undefined)}
          >
            <Text style={[styles.companyChipText, selectedCompanyIds.size === 0 && styles.companyChipTextActive]}>{t('common.all')}</Text>
          </Pressable>
          {filteredCompanies.map((company: Company) => {
            const isSelected = selectedCompanyIds.has(company.id);
            return (
              <View
                key={company.id}
                onLayout={(e) => {
                  companyPositions.current[company.id] = e.nativeEvent.layout.x;
                }}
              >
                <Pressable
                  style={[styles.companyChip, isSelected && styles.companyChipActive]}
                  onPress={() => handleCompanySelect(company.id)}
                >
                  <Text
                    style={[styles.companyChipText, isSelected && styles.companyChipTextActive]}
                    numberOfLines={1}
                  >
                    {company.name}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          {feedMode === 'following' && filteredCompanies.length === 0 && (
            <View style={styles.emptyCompaniesHint}>
              <Text style={styles.emptyCompaniesHintText}>{t('home.noFollowedCompanies')}</Text>
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
            {t('home.jobCount', { shown: jobs.length, total: totalCount })}
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
              <Text style={styles.emptyTitle}>{t('home.noJobs')}</Text>
              <Text style={styles.emptyText}>
                {feedMode === 'following'
                  ? t('home.noJobsFollowing')
                  : t('home.noJobsFilter')}
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

  // Companies
  companiesSection: {
    marginBottom: 12,
  },
  companiesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  companyChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  companyChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  companyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  companyChipTextActive: {
    color: '#fff',
  },
  emptyCompaniesHint: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emptyCompaniesHintText: {
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
