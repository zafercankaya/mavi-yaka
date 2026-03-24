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
import { fetchCompanies, Company } from '../../src/api/companies';
import { fetchFollows, followCompany, unfollowCompany, FollowedCompany, FollowsData } from '../../src/api/follows';
import { fetchSavedJobs, toggleSavedJob } from '../../src/api/saved-jobs';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import { fetchEntitlement } from '../../src/api/subscriptions';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';
import JobCard from '../../src/components/JobCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { maybeRequestReview } from '../../src/hooks/useStoreReview';
import { trackEvent } from '../../src/hooks/useAnalytics';
import { getApiErrorMessage } from '../../src/utils/api-error';

type Segment = 'companies' | 'savedJobs';

export default function FollowsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const market = useMarketStore((s) => s.market);
  const adFree = useAdFree();
  const queryClient = useQueryClient();

  const [segment, setSegment] = useState<Segment>('companies');
  const [companiesSectorFilter, setCompaniesSectorFilter] = useState<string | undefined>();
  const segmentAnim = useRef(new Animated.Value(0)).current;
  const companiesListRef = useRef<FlatList>(null);
  const savedJobsListRef = useRef<FlatList>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  useScrollToTop(segment === 'companies' ? companiesListRef : savedJobsListRef);

  const { data: companiesData } = useQuery({
    queryKey: ['companies', market],
    queryFn: () => fetchCompanies().then((r) => r.data),
  });

  const { data: followsData, isLoading: followsLoading } = useQuery<FollowsData>({
    queryKey: ['follows'],
    queryFn: fetchFollows,
    enabled: isAuthenticated,
  });

  // Saved jobs query (jobs user saved)
  const { data: savedJobsData, isLoading: savedJobsLoading } = useQuery({
    queryKey: ['saved-jobs', 'active', market],
    queryFn: () => fetchSavedJobs('active'),
    enabled: isAuthenticated && segment === 'savedJobs',
  });

  const removeSavedJobMutation = useMutation({
    mutationFn: toggleSavedJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-job-status'] });
    },
  });

  const followMutation = useMutation({
    mutationFn: followCompany,
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
    mutationFn: unfollowCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follows'] }),
    onError: (err: any) => {
      const msg = getApiErrorMessage(err, t, 'follows.unfollowError');
      Alert.alert(t('common.error'), msg);
    },
  });

  const followedCompanyIds = useMemo(() => {
    const set = new Set<string>();
    (followsData?.companies ?? []).forEach((f) => {
      set.add(f.companyId);
    });
    return set;
  }, [followsData]);

  const getFollowByCompanyId = useCallback((companyId: string): FollowedCompany | undefined => {
    return (followsData?.companies ?? []).find((f) => f.companyId === companyId);
  }, [followsData]);

  const SCREEN_WIDTH = Dimensions.get('window').width;

  const handleSectorFilter = useCallback((sectorId: string | undefined) => {
    const newId = sectorId === companiesSectorFilter ? undefined : sectorId;
    setCompaniesSectorFilter(newId);
    // Scroll to selected sector chip so it stays visible
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
  }, [companiesSectorFilter, SCREEN_WIDTH]);

  const filteredCompanies = useMemo(() => {
    let list = companiesData ?? [];
    if (companiesSectorFilter) {
      list = list.filter((c: Company) => c.sector === companiesSectorFilter);
    }
    return [...list].sort((a: Company, b: Company) => a.name.localeCompare(b.name, 'tr'));
  }, [companiesData, companiesSectorFilter]);

  const followedCompaniesList = useMemo(() =>
    (companiesData ?? []).filter((c: Company) => followedCompanyIds.has(c.id)),
  [companiesData, followedCompanyIds]);

  const handleSegmentChange = useCallback((newSegment: Segment) => {
    setSegment(newSegment);
    Animated.spring(segmentAnim, {
      toValue: newSegment === 'companies' ? 0 : 1,
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
    return (followsData?.companies ?? []).filter((f) => f.isFrozen).length;
  }, [followsData]);

  const handleToggle = (company: Company) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    const follow = getFollowByCompanyId(company.id);
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
    const isFollowed = followedCompanyIds.has(company.id);
    if (isFollowed) {
      unfollowMutation.mutate(company.id);
      trackEvent('company_unfollow', { company_id: company.id, company_name: company.name });
    } else {
      followMutation.mutate(company.id);
      trackEvent('company_follow', { company_id: company.id, company_name: company.name });
    }
  };

  // Segment control
  const renderSegmentControl = () => (
    <View style={styles.segmentContainer}>
      <View style={styles.segmentTrack}>
        <Pressable
          style={[styles.segmentButton, segment === 'companies' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('companies')}
        >
          <Store size={15} color={segment === 'companies' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'companies' && styles.segmentTextActive]}>{t('common.companies')}</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, segment === 'savedJobs' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('savedJobs')}
        >
          <Heart size={15} color={segment === 'savedJobs' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'savedJobs' && styles.segmentTextActive]}>{t('follows.savedJobs')}</Text>
        </Pressable>
      </View>
    </View>
  );

  // Company list item
  const renderCompanyItem = ({ item }: { item: Company }) => {
    const following = followedCompanyIds.has(item.id);
    const follow = getFollowByCompanyId(item.id);
    const frozen = follow?.isFrozen ?? false;

    return (
      <Pressable style={[styles.companyCard, frozen && styles.companyCardFrozen]} onPress={() => handleToggle(item)}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={[styles.companyLogo, frozen && { opacity: 0.5 }]} contentFit="cover" />
        ) : (
          <View style={[styles.companyLogo, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.borderLight }, frozen && { opacity: 0.5 }]}>
            <Store size={20} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, frozen && { color: Colors.textTertiary }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.companyMeta}>
            {frozen && (
              <View style={[styles.miniTag, { backgroundColor: Colors.textTertiary + '20' }]}>
                <Lock size={10} color={Colors.textTertiary} />
                <Text style={[styles.miniTagText, { color: Colors.textTertiary }]}>{t('follows.frozen')}</Text>
              </View>
            )}
            {item.sector && !frozen && (
              <View style={[styles.miniTag, { backgroundColor: Colors.primaryLight + '20' }]}>
                <Text style={[styles.miniTagText, { color: Colors.primary }]}>{t(`sector.${item.sector}`)}</Text>
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

  // Sector filter bar — rendered outside FlatList so scroll position is preserved
  const sectors = useMemo(() => {
    const set = new Set<string>();
    (companiesData ?? []).forEach((c: Company) => { if (c.sector) set.add(c.sector); });
    return Array.from(set).sort();
  }, [companiesData]);

  const renderSectorFilter = () => (
    <View>
      <ScrollView ref={categoryScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryList, { paddingTop: 10 }]}>
        <Pressable
          style={[styles.categoryChip, !companiesSectorFilter && styles.categoryChipActive]}
          onPress={() => handleSectorFilter(undefined)}
        >
          <LayoutGrid size={14} color={!companiesSectorFilter ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.categoryChipText, !companiesSectorFilter && styles.categoryChipTextActive]}>{t('common.all')}</Text>
        </Pressable>
        {sectors.map((sector: string) => (
          <Pressable
            key={sector}
            style={[styles.categoryChip, companiesSectorFilter === sector && styles.categoryChipActiveColored]}
            onPress={() => handleSectorFilter(sector)}
            onLayout={(e) => { categoryPositions.current[sector] = e.nativeEvent.layout.x; }}
          >
            <Text style={[styles.categoryChipText, companiesSectorFilter === sector && styles.categoryChipTextActive]}>
              {t(`sector.${sector}`)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // Companies header (inside FlatList — stats + company count only)
  const renderCompaniesHeader = () => (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Store size={18} color={Colors.primary} />
          <Text style={styles.statValue}>{followedCompaniesList.length}</Text>
          <Text style={styles.statLabel}>{t('follows.followed')}</Text>
        </View>
        <View style={styles.statCard}>
          <ShoppingBag size={18} color={Colors.accent} />
          <Text style={styles.statValue}>{(companiesData ?? []).length}</Text>
          <Text style={styles.statLabel}>{t('follows.totalCompanies')}</Text>
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

      <View style={styles.companiesHeader}>
        <Text style={styles.sectionTitle}>
          {companiesSectorFilter
            ? t('follows.companiesBySector', { name: t(`sector.${companiesSectorFilter}`) })
            : t('follows.allCompanies')}
        </Text>
        <Text style={styles.companiesCount}>{t('follows.companyCount', { count: filteredCompanies.length })}</Text>
      </View>
    </View>
  );


  // Inject ad slots into saved jobs list
  const savedJobsWithAds = useMemo(() => {
    const jobs = savedJobsData ?? [];
    if (adFree || jobs.length === 0) return jobs;
    const result: any[] = [];
    jobs.forEach((j: any, i: number) => {
      result.push(j);
      if ((i + 1) % AD_INTERVAL === 0) {
        result.push({ _type: 'ad', _id: `job-ad-${i}` });
      }
    });
    return result;
  }, [savedJobsData, adFree]);

  // Saved job item renderer — uses the same JobCard as the home page
  const renderSavedJobItem = ({ item }: { item: any }) => {
    if (item._type === 'ad') {
      return <AdBanner />;
    }
    return <JobCard job={item.job} />;
  };

  // Saved jobs header (inside FlatList — without segment control)
  const renderSavedJobsListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{t('follows.savedJobs')}</Text>
      <Text style={styles.sectionSubtitle}>
        {t('follows.savedCount', { count: (savedJobsData ?? []).length })}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (segment === 'companies') {
      return (
        <View style={{ flex: 1 }}>
          {renderSegmentControl()}
          {renderSectorFilter()}
          <FlatList
            ref={companiesListRef}
            data={filteredCompanies}
            keyExtractor={(item) => item.id}
            renderItem={renderCompanyItem}
            ListHeaderComponent={renderCompaniesHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Store size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>{t('follows.noCompaniesInSector')}</Text>
                <Text style={styles.emptyText}>{t('follows.noCompaniesHint')}</Text>
              </View>
            }
          />
        </View>
      );
    }

    // Saved jobs segment
    if (savedJobsLoading) {
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
          ref={savedJobsListRef}
          data={savedJobsWithAds}
          keyExtractor={(item) => item._type === 'ad' ? item._id : item.id}
          renderItem={renderSavedJobItem}
          ListHeaderComponent={renderSavedJobsListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t('follows.noSavedJobs')}</Text>
              <Text style={styles.emptyText}>
                {t('follows.noSavedJobsHint')}
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

  // Companies
  companiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  companiesCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  companyCard: {
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
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  companyMeta: {
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
  companyCardFrozen: {
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
