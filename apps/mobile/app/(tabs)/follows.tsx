import { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, ScrollView, Dimensions,
  ActivityIndicator, StyleSheet, Animated, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Store, LayoutGrid, ShoppingBag, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { fetchBrands, fetchCategories, Brand, Category, getCategoryDisplayName, sortCategories } from '../../src/api/brands';
import { fetchFollows, createFollow, deleteFollow, Follow } from '../../src/api/follows';
import { fetchFavorites, toggleFavorite } from '../../src/api/favorites';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import { fetchEntitlement } from '../../src/api/subscriptions';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';
import CampaignCard from '../../src/components/CampaignCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { maybeRequestReview } from '../../src/hooks/useStoreReview';
import { trackEvent } from '../../src/hooks/useAnalytics';
import { getApiErrorMessage } from '../../src/utils/api-error';

type Segment = 'brands' | 'campaigns';

export default function FollowsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const market = useMarketStore((s) => s.market);
  const adFree = useAdFree();
  const queryClient = useQueryClient();

  const [segment, setSegment] = useState<Segment>('brands');
  const [brandsCategoryFilter, setBrandsCategoryFilter] = useState<string | undefined>();
  const segmentAnim = useRef(new Animated.Value(0)).current;
  const brandsListRef = useRef<FlatList>(null);
  const campaignsListRef = useRef<FlatList>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  useScrollToTop(segment === 'brands' ? brandsListRef : campaignsListRef);

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories().then((r) => r.data),
  });

  const categoriesData = useMemo(
    () => sortCategories(categoriesRaw ?? [], market),
    [categoriesRaw, market],
  );

  const { data: brandsData } = useQuery({
    queryKey: ['brands', market],
    queryFn: () => fetchBrands().then((r) => r.data),
  });

  const { data: followsData, isLoading: followsLoading } = useQuery({
    queryKey: ['follows'],
    queryFn: () => fetchFollows().then((r) => r.data),
    enabled: isAuthenticated,
  });

  // Favorited campaigns query (campaigns user hearted)
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', 'active', market],
    queryFn: () => fetchFavorites('active'),
    enabled: isAuthenticated && segment === 'campaigns',
  });

  const removeFavMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-status'] });
    },
  });

  const followMutation = useMutation({
    mutationFn: createFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      maybeRequestReview();
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg = getApiErrorMessage(err, t, 'follows.followError');
      const title = status === 403 ? t('common.warning') : t('common.error');
      Alert.alert(title, msg);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: deleteFollow,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follows'] }),
    onError: (err: any) => {
      const msg = getApiErrorMessage(err, t, 'follows.unfollowError');
      Alert.alert(t('common.error'), msg);
    },
  });

  const followedBrandIds = useMemo(() => {
    const set = new Set<string>();
    (followsData ?? []).forEach((f: Follow) => {
      if (f.brandId) set.add(f.brandId);
    });
    return set;
  }, [followsData]);

  const getFollowByBrandId = useCallback((brandId: string): Follow | undefined => {
    return (followsData ?? []).find((f: Follow) => f.brandId === brandId);
  }, [followsData]);

  const SCREEN_WIDTH = Dimensions.get('window').width;

  const handleCategoryFilter = useCallback((catId: string | undefined) => {
    const newId = catId === brandsCategoryFilter ? undefined : catId;
    setBrandsCategoryFilter(newId);
    // Scroll to selected category chip so it stays visible
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
  }, [brandsCategoryFilter, SCREEN_WIDTH]);

  const filteredBrands = useMemo(() => {
    let list = brandsData ?? [];
    if (brandsCategoryFilter) {
      list = list.filter((b: Brand) => b.categoryId === brandsCategoryFilter);
    }
    return [...list].sort((a: Brand, b: Brand) => a.name.localeCompare(b.name, 'tr'));
  }, [brandsData, brandsCategoryFilter]);

  const followedBrandsList = useMemo(() =>
    (brandsData ?? []).filter((b: Brand) => followedBrandIds.has(b.id)),
  [brandsData, followedBrandIds]);

  const handleSegmentChange = useCallback((newSegment: Segment) => {
    setSegment(newSegment);
    Animated.spring(segmentAnim, {
      toValue: newSegment === 'brands' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [segmentAnim]);

  const { data: entitlement } = useQuery({
    queryKey: ['entitlement'],
    queryFn: fetchEntitlement,
    enabled: isAuthenticated,
  });

  const frozenCount = useMemo(() => {
    return (followsData ?? []).filter((f: Follow) => f.isFrozen).length;
  }, [followsData]);

  const handleToggle = (brand: Brand) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    const follow = getFollowByBrandId(brand.id);
    if (follow?.isFrozen) {
      Alert.alert(
        t('follows.frozenTitle'),
        t('follows.frozenMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('follows.upgradeToPremium'), onPress: () => router.push('/subscription') },
        ],
      );
      return;
    }
    const isFollowed = followedBrandIds.has(brand.id);
    if (isFollowed) {
      if (follow) unfollowMutation.mutate(follow.id);
      trackEvent('brand_unfollow', { brand_id: brand.id, brand_name: brand.name });
    } else {
      followMutation.mutate({ brandId: brand.id });
      trackEvent('brand_follow', { brand_id: brand.id, brand_name: brand.name });
    }
  };

  // Segment control
  const renderSegmentControl = () => (
    <View style={styles.segmentContainer}>
      <View style={styles.segmentTrack}>
        <Pressable
          style={[styles.segmentButton, segment === 'brands' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('brands')}
        >
          <Store size={15} color={segment === 'brands' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'brands' && styles.segmentTextActive]}>{t('common.brands')}</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, segment === 'campaigns' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('campaigns')}
        >
          <Heart size={15} color={segment === 'campaigns' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'campaigns' && styles.segmentTextActive]}>{t('common.campaigns')}</Text>
        </Pressable>
      </View>
    </View>
  );

  // Brand list item
  const renderBrandItem = ({ item }: { item: Brand }) => {
    const following = followedBrandIds.has(item.id);
    const follow = getFollowByBrandId(item.id);
    const frozen = follow?.isFrozen ?? false;
    const category = (categoriesData ?? []).find((c: Category) => c.id === item.categoryId);

    return (
      <Pressable style={[styles.brandCard, frozen && styles.brandCardFrozen]} onPress={() => handleToggle(item)}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={[styles.brandLogo, frozen && { opacity: 0.5 }]} contentFit="cover" />
        ) : (
          <View style={[styles.brandLogo, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.borderLight }, frozen && { opacity: 0.5 }]}>
            <Store size={20} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.brandInfo}>
          <Text style={[styles.brandName, frozen && { color: Colors.textTertiary }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.brandMeta}>
            {frozen && (
              <View style={[styles.miniTag, { backgroundColor: Colors.textTertiary + '20' }]}>
                <Lock size={10} color={Colors.textTertiary} />
                <Text style={[styles.miniTagText, { color: Colors.textTertiary }]}>{t('follows.frozen')}</Text>
              </View>
            )}
            {category && !frozen && (
              <View style={[styles.miniTag, { backgroundColor: Colors.primaryLight + '20' }]}>
                <Text style={[styles.miniTagText, { color: Colors.primary }]}>{getCategoryDisplayName(category, market)}</Text>
              </View>
            )}
          </View>
        </View>
        {frozen ? (
          <View style={styles.frozenButton}>
            <Lock size={14} color={Colors.textTertiary} />
          </View>
        ) : (
          <View style={[styles.followButton, following && styles.followButtonActive]}>
            <Heart
              size={14}
              color={following ? '#fff' : Colors.primary}
              fill={following ? '#fff' : 'transparent'}
            />
            <Text style={[styles.followButtonText, following && styles.followButtonTextActive]}>
              {following ? t('follows.following_btn') : t('follows.follow')}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  // Category filter bar — rendered outside FlatList so scroll position is preserved
  const renderCategoryFilter = () => (
    <View>
      <ScrollView ref={categoryScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryList, { paddingTop: 10 }]}>
        <Pressable
          style={[styles.categoryChip, !brandsCategoryFilter && styles.categoryChipActive]}
          onPress={() => handleCategoryFilter(undefined)}
        >
          <LayoutGrid size={14} color={!brandsCategoryFilter ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.categoryChipText, !brandsCategoryFilter && styles.categoryChipTextActive]}>{t('common.all')}</Text>
        </Pressable>
        {(categoriesData ?? []).map((cat: Category) => (
          <Pressable
            key={cat.id}
            style={[styles.categoryChip, brandsCategoryFilter === cat.id && styles.categoryChipActiveColored]}
            onPress={() => handleCategoryFilter(cat.id)}
            onLayout={(e) => { categoryPositions.current[cat.id] = e.nativeEvent.layout.x; }}
          >
            <Text style={[styles.categoryChipText, brandsCategoryFilter === cat.id && styles.categoryChipTextActive]}>
              {getCategoryDisplayName(cat, market)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // Brands header (inside FlatList — stats + brand count only)
  const renderBrandsHeader = () => (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Store size={18} color={Colors.primary} />
          <Text style={styles.statValue}>{followedBrandsList.length}</Text>
          <Text style={styles.statLabel}>{t('follows.followed')}</Text>
        </View>
        <View style={styles.statCard}>
          <ShoppingBag size={18} color={Colors.accent} />
          <Text style={styles.statValue}>{(brandsData ?? []).length}</Text>
          <Text style={styles.statLabel}>{t('follows.totalBrands')}</Text>
        </View>
      </View>

      {/* Frozen banner */}
      {frozenCount > 0 && (
        <Pressable style={styles.frozenBanner} onPress={() => router.push('/subscription')}>
          <Lock size={16} color={Colors.warning} />
          <Text style={styles.frozenBannerText}>
            {t('follows.frozenBanner', { count: frozenCount })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
        </Pressable>
      )}

      <View style={styles.brandsHeader}>
        <Text style={styles.sectionTitle}>
          {brandsCategoryFilter
            ? t('follows.brandsByCat', { name: (() => { const c = (categoriesData ?? []).find((c: Category) => c.id === brandsCategoryFilter); return c ? getCategoryDisplayName(c, market) : ''; })() })
            : t('follows.allBrands')}
        </Text>
        <Text style={styles.brandsCount}>{t('follows.brandCount', { count: filteredBrands.length })}</Text>
      </View>
    </View>
  );


  // Inject ad slots into favorites list
  const favoritesWithAds = useMemo(() => {
    const favs = favoritesData ?? [];
    if (adFree || favs.length === 0) return favs;
    const result: any[] = [];
    favs.forEach((f: any, i: number) => {
      result.push(f);
      if ((i + 1) % AD_INTERVAL === 0) {
        result.push({ _type: 'ad', _id: `fav-ad-${i}` });
      }
    });
    return result;
  }, [favoritesData, adFree]);

  // Favorite item renderer — uses the same CampaignCard as the home page
  const renderFavoriteItem = ({ item }: { item: any }) => {
    if (item._type === 'ad') {
      return <AdBanner />;
    }
    return <CampaignCard campaign={item.campaign} />;
  };

  // Campaigns header (inside FlatList — without segment control)
  const renderCampaignsListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{t('follows.favoriteCampaigns')}</Text>
      <Text style={styles.sectionSubtitle}>
        {t('follows.savedCount', { count: (favoritesData ?? []).length })}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (segment === 'brands') {
      return (
        <View style={{ flex: 1 }}>
          {renderSegmentControl()}
          {renderCategoryFilter()}
          <FlatList
            ref={brandsListRef}
            data={filteredBrands}
            keyExtractor={(item) => item.id}
            renderItem={renderBrandItem}
            ListHeaderComponent={renderBrandsHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Store size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>{t('follows.noBrandsInCategory')}</Text>
                <Text style={styles.emptyText}>{t('follows.noBrandsHint')}</Text>
              </View>
            }
          />
        </View>
      );
    }

    // Campaigns segment = favorited campaigns
    if (favoritesLoading) {
      return (
        <View style={{ flex: 1 }}>
          {renderSegmentControl()}
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {renderSegmentControl()}
        <FlatList
          ref={campaignsListRef}
          data={favoritesWithAds}
          keyExtractor={(item) => item._type === 'ad' ? item._id : item.id}
          renderItem={renderFavoriteItem}
          ListHeaderComponent={renderCampaignsListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t('follows.noFavorites')}</Text>
              <Text style={styles.emptyText}>
                {t('follows.noFavoritesHint')}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>{t('follows.myFollows')}</Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Heart size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>{t('follows.loginToFollow')}</Text>
          <Text style={styles.emptyText}>{t('follows.guestFollowHint')}</Text>
          <Pressable
            style={styles.emptyAction}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.emptyActionText}>{t('guest.signUpFree')}</Text>
          </Pressable>
        </View>
      ) : followsLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        renderContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  listContent: {
    paddingBottom: TAB_BAR_HEIGHT + 10,
  },

  // Segment
  segmentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: '#fff',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },

  // Section
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 2,
  },

  // Category chips
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipActiveColored: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Brands
  brandsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  brandsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
  },
  brandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  brandMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  miniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 5,
  },
  followButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  followButtonTextActive: {
    color: '#fff',
  },
  brandCardFrozen: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  frozenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frozenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  frozenBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
