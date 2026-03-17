import { useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  RefreshControl, Pressable, Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Building2, Globe, Briefcase } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { fetchCompanyById, Company } from '../../src/api/companies';
import { fetchJobs, JobListing } from '../../src/api/jobs';
import { useMarketStore } from '../../src/store/market';
import { useAuthStore } from '../../src/store/auth';
import JobCard from '../../src/components/JobCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const market = useMarketStore((s) => s.market);

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompanyById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const {
    data: jobsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: jobsLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['company-jobs', id, market],
    queryFn: ({ pageParam }) =>
      fetchJobs({ companyId: id!, cursor: pageParam as string | undefined, limit: 15 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
    enabled: !!id,
  });

  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((p) => p.data) ?? [];
  }, [jobsData]);
  const totalJobs = jobsData?.pages[0]?.meta?.total ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleJobPress = useCallback((job: JobListing) => {
    router.push(`/job/${job.id}`);
  }, [router]);

  if (companyLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.center}>
        <Building2 size={48} color={Colors.textLight} />
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  const headerElement = (
    <View style={styles.profileHeader}>
      {/* Logo */}
      {company.logoUrl ? (
        <Image
          source={{ uri: company.logoUrl }}
          style={styles.logo}
          contentFit="contain"
          transition={200}
        />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Building2 size={32} color={Colors.primary} />
        </View>
      )}

      {/* Name & sector */}
      <Text style={styles.companyName}>{company.name}</Text>
      {company.sector && (
        <View style={styles.sectorBadge}>
          <Text style={styles.sectorText}>{t(`sector.${company.sector}`, company.sector)}</Text>
        </View>
      )}

      {/* Description */}
      {company.description && (
        <Text style={styles.description}>{company.description}</Text>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Briefcase size={16} color={Colors.primary} />
          <Text style={styles.statValue}>{totalJobs}</Text>
          <Text style={styles.statLabel}>{t('common.jobs')}</Text>
        </View>
        {company.websiteUrl && (
          <Pressable
            style={styles.statItem}
            onPress={() => Linking.openURL(company.websiteUrl!)}
          >
            <Globe size={16} color={Colors.primary} />
            <Text style={[styles.statLabel, { color: Colors.primary }]}>{t('common.website', 'Web sitesi')}</Text>
          </Pressable>
        )}
      </View>

      {/* Jobs section header */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.jobsSectionTitle}>
          {t('job.companyJobs', { name: company.name })}
        </Text>
        <Text style={styles.jobsCount}>{totalJobs}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: company.name }} />
      <FlatList
        data={jobsLoading ? [] : jobs}
        renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={headerElement}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={Colors.primary} style={{ padding: 24 }} />
          ) : null
        }
        ListEmptyComponent={
          jobsLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Briefcase size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>{t('home.noJobs')}</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary },
  listContent: { paddingBottom: Spacing.xxl },

  profileHeader: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  sectorBadge: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  sectorText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  jobsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  jobsSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  jobsCount: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
