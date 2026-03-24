import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, TextInput, FlatList, ActivityIndicator, RefreshControl,
  Text, StyleSheet, Pressable, Keyboard, ScrollView, Dimensions, Platform, KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Search, X, LayoutGrid, SlidersHorizontal, ChevronDown, ChevronUp, MapPin,
  Truck, Factory, ShoppingCart, HardHat, UtensilsCrossed,
  Car, Shirt, Pickaxe, Stethoscope, Hotel,
  Wheat, ShieldCheck, Building2, Wrench, FlaskConical,
  Package, Smartphone, MoreHorizontal,
} from 'lucide-react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchJobs, JobListing, JobFilters, searchLocations, LocationResult } from '../../src/api/jobs';
import { fetchCompanies, Company } from '../../src/api/companies';
import JobCard from '../../src/components/JobCard';
import { AdBanner } from '../../src/components/AdBanner';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_INTERVAL } from '../../src/constants/ads';
import { FilterChip } from '../../src/components/FilterChip';
import { useMarketStore } from '../../src/store/market';
import { Colors, TAB_BAR_HEIGHT } from '../../src/constants/theme';

type AdItem = { _type: 'ad'; _id: string };
type ListItem = JobListing | AdItem;

const SCREEN_WIDTH = Dimensions.get('window').width;

const SORT_KEYS = ['recommended', 'newest', 'deadline', 'posted_today', 'salary_high', 'salary_low'] as const;

const JOB_TYPE_KEYS = ['FULL_TIME', 'PART_TIME', 'DAILY', 'SEASONAL', 'INTERNSHIP', 'CONTRACT'] as const;
const WORK_MODE_KEYS = ['ON_SITE', 'REMOTE', 'HYBRID'] as const;
const EXPERIENCE_KEYS = ['NONE', 'ENTRY', 'MID', 'SENIOR'] as const;

const SECTOR_META: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  'LOGISTICS_TRANSPORTATION': { icon: Truck,             color: '#4A90D9' },
  'MANUFACTURING':            { icon: Factory,           color: '#636E72' },
  'RETAIL':                   { icon: ShoppingCart,       color: '#2ED573' },
  'CONSTRUCTION':             { icon: HardHat,           color: '#FF9F43' },
  'FOOD_BEVERAGE':            { icon: UtensilsCrossed,   color: '#FD7E14' },
  'AUTOMOTIVE':               { icon: Car,               color: '#1E3A5F' },
  'TEXTILE':                  { icon: Shirt,             color: '#E8553A' },
  'MINING_ENERGY':            { icon: Pickaxe,           color: '#8B6914' },
  'HEALTHCARE':               { icon: Stethoscope,       color: '#E74C3C' },
  'HOSPITALITY_TOURISM':      { icon: Hotel,             color: '#0ABDE3' },
  'AGRICULTURE':              { icon: Wheat,             color: '#27AE60' },
  'SECURITY_SERVICES':        { icon: ShieldCheck,       color: '#2C7A7B' },
  'FACILITY_MANAGEMENT':      { icon: Building2,         color: '#7C5CFC' },
  'METAL_STEEL':              { icon: Wrench,            color: '#95A5A6' },
  'CHEMICALS_PLASTICS':       { icon: FlaskConical,      color: '#9B59B6' },
  'ECOMMERCE_CARGO':          { icon: Package,           color: '#00B894' },
  'TELECOMMUNICATIONS':       { icon: Smartphone,        color: '#00CEC9' },
  'OTHER':                    { icon: MoreHorizontal,    color: '#9CA3AF' },
};

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
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Advanced filters (multi-select)
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<string>>(new Set());
  const [selectedWorkModes, setSelectedWorkModes] = useState<Set<string>>(new Set());
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(new Set());
  const [salaryMinText, setSalaryMinText] = useState('');
  const [salaryMaxText, setSalaryMaxText] = useState('');
  const [stateText, setStateText] = useState('');
  const [selectedLocationState, setSelectedLocationState] = useState<string | undefined>();
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [locationSelected, setLocationSelected] = useState(false);

  const activeFilterCount = (categoryId ? 1 : 0) +
    (selectedCompanyIds.size > 0 ? 1 : 0) +
    (selectedJobTypes.size > 0 ? 1 : 0) +
    (selectedWorkModes.size > 0 ? 1 : 0) +
    (selectedExperiences.size > 0 ? 1 : 0) +
    (salaryMinText ? 1 : 0) +
    (salaryMaxText ? 1 : 0) +
    (selectedLocationState ? 1 : 0);

  const toggleFilters = () => {
    setFiltersVisible((v) => !v);
  };

  const clearAllFilters = () => {
    setCategoryId(undefined);
    setSelectedCompanyIds(new Set());
    setSelectedJobTypes(new Set());
    setSelectedWorkModes(new Set());
    setSelectedExperiences(new Set());
    setSalaryMinText('');
    setSalaryMaxText('');
    setStateText('');
    setSelectedLocationState(undefined);
    setLocationSuggestions([]);
    setLocationSelected(false);
  };

  const categoryScrollRef = useRef<ScrollView>(null);
  const companyScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<Record<string, number>>({});
  const companyPositions = useRef<Record<string, number>>({});

  const { data: companiesData } = useQuery({
    queryKey: ['companies', market],
    queryFn: () => fetchCompanies().then((r) => r.data),
  });

  const filteredCompanies = useMemo(() => {
    if (!companiesData) return [];
    if (categoryId) {
      return companiesData.filter((c: Company) => c.sector === categoryId);
    }
    return companiesData;
  }, [companiesData, categoryId]);

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
    setSelectedCompanyIds(new Set());
    companyScrollRef.current?.scrollTo({ x: 0, animated: false });
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
    if (companyPositions.current[bId] !== undefined) {
      const targetX = companyPositions.current[bId];
      const scrollX = Math.max(0, targetX - SCREEN_WIDTH / 2 + 45);
      setTimeout(() => {
        companyScrollRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 50);
    }
  };

  const companyIdsArray = useMemo(() => Array.from(selectedCompanyIds), [selectedCompanyIds]);
  const jobTypesArray = useMemo(() => Array.from(selectedJobTypes), [selectedJobTypes]);
  const workModesArray = useMemo(() => Array.from(selectedWorkModes), [selectedWorkModes]);
  const experiencesArray = useMemo(() => Array.from(selectedExperiences), [selectedExperiences]);

  const filters = useMemo<JobFilters>(() => {
    const f: JobFilters = {
      sort: sort as any,
      limit: 15,
    };
    if (debouncedQuery.length >= 2) f.search = debouncedQuery;
    if (companyIdsArray.length > 0) {
      f.companyIds = companyIdsArray;
    } else if (categoryId) {
      f.sector = categoryId;
    }
    if (jobTypesArray.length > 0) f.jobType = jobTypesArray;
    if (workModesArray.length > 0) f.workMode = workModesArray;
    if (experiencesArray.length > 0) f.experienceLevel = experiencesArray;
    const salMin = parseInt(salaryMinText, 10);
    const salMax = parseInt(salaryMaxText, 10);
    if (salMin > 0) f.salaryMin = salMin;
    if (salMax > 0) f.salaryMax = salMax;
    if (selectedLocationState) f.state = selectedLocationState;
    return f;
  }, [companyIdsArray, categoryId, sort, debouncedQuery, jobTypesArray, workModesArray, experiencesArray, salaryMinText, salaryMaxText, selectedLocationState]);

  const queryKey = useMemo(
    () => ['search-jobs', market, companyIdsArray.join(','), categoryId ?? '', sort, debouncedQuery, jobTypesArray.join(','), workModesArray.join(','), experiencesArray.join(','), salaryMinText, salaryMaxText, selectedLocationState ?? ''] as const,
    [market, companyIdsArray, categoryId, sort, debouncedQuery, jobTypesArray, workModesArray, experiencesArray, salaryMinText, salaryMaxText, selectedLocationState],
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

  const headerElement = (
    <View>
      {/* Filters (toggled by filter icon) */}
      {filtersVisible && (
        <View style={styles.filtersPanel}>
          {/* Clear all */}
          {activeFilterCount > 0 && (
            <Pressable style={styles.clearAllBtn} onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>{t('filter.clear')} ({activeFilterCount})</Text>
            </Pressable>
          )}

          {/* Categories */}
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
                        {t(`sector.${slug}`)}
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
            </ScrollView>
          </View>

          {/* Job Type (multi-select) */}
          <View style={styles.filterGroup}>
            <Text style={styles.sectionLabel}>{t('filter.jobType')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
              <FilterChip
                label={t('common.all')}
                selected={selectedJobTypes.size === 0}
                onPress={() => setSelectedJobTypes(new Set())}
                color={Colors.primary}
              />
              {JOB_TYPE_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`jobType.${key}`)}
                  selected={selectedJobTypes.has(key)}
                  onPress={() => setSelectedJobTypes((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  })}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>
          </View>

          {/* Work Mode (multi-select) */}
          <View style={styles.filterGroup}>
            <Text style={styles.sectionLabel}>{t('filter.workMode')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
              <FilterChip
                label={t('common.all')}
                selected={selectedWorkModes.size === 0}
                onPress={() => setSelectedWorkModes(new Set())}
                color={Colors.primary}
              />
              {WORK_MODE_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`workMode.${key}`)}
                  selected={selectedWorkModes.has(key)}
                  onPress={() => setSelectedWorkModes((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  })}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>
          </View>

          {/* Experience (multi-select) */}
          <View style={styles.filterGroup}>
            <Text style={styles.sectionLabel}>{t('filter.experience')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
              <FilterChip
                label={t('common.all')}
                selected={selectedExperiences.size === 0}
                onPress={() => setSelectedExperiences(new Set())}
                color={Colors.primary}
              />
              {EXPERIENCE_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`experience.${key}`)}
                  selected={selectedExperiences.has(key)}
                  onPress={() => setSelectedExperiences((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  })}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>
          </View>

          {/* Salary Range */}
          <View style={styles.filterGroup}>
            <Text style={styles.sectionLabel}>{t('filter.salary')}</Text>
            <View style={styles.salaryInputRow}>
              <TextInput
                style={styles.salaryInput}
                placeholder={t('salary.min')}
                placeholderTextColor={Colors.textTertiary}
                value={salaryMinText}
                onChangeText={setSalaryMinText}
                keyboardType="numeric"
              />
              <Text style={styles.salaryDash}>-</Text>
              <TextInput
                style={styles.salaryInput}
                placeholder={t('salary.max')}
                placeholderTextColor={Colors.textTertiary}
                value={salaryMaxText}
                onChangeText={setSalaryMaxText}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.filterGroup}>
            <Text style={styles.sectionLabel}>{t('filter.location')}</Text>
            <View style={styles.locationInputRow}>
              <MapPin size={16} color={Colors.textTertiary} />
              <TextInput
                style={[styles.locationInput, { flex: 1 }]}
                placeholder={t('filter.state')}
                placeholderTextColor={Colors.textTertiary}
                value={stateText}
                onChangeText={(text) => {
                  setStateText(text);
                  setLocationSelected(false);
                  if (text.trim().length >= 2) {
                    searchLocations(text.trim(), 15, 'state').then(setLocationSuggestions).catch(() => {});
                  } else {
                    setLocationSuggestions([]);
                  }
                }}
                returnKeyType="done"
              />
              {stateText.length > 0 && (
                <Pressable onPress={() => { setStateText(''); setLocationSuggestions([]); setLocationSelected(false); setSelectedLocationState(undefined); }} hitSlop={8}>
                  <X size={14} color={Colors.textTertiary} />
                </Pressable>
              )}
            </View>
            {locationSuggestions.length > 0 && !locationSelected && (
              <View style={styles.locationDropdown}>
                {locationSuggestions.map((loc, i) => (
                  <TouchableOpacity
                    key={`${loc.state}-${loc.city}-${i}`}
                    style={styles.locationOption}
                    activeOpacity={0.6}
                    onPress={() => {
                      const display = loc.nameLocal || loc.state || '';
                      setStateText(display);
                      setSelectedLocationState(loc.state || undefined);
                      setLocationSuggestions([]);
                      setLocationSelected(true);
                      Keyboard.dismiss();
                    }}
                  >
                    <MapPin size={12} color={Colors.textTertiary} />
                    <Text style={styles.locationOptionText} numberOfLines={1}>
                      {loc.nameLocal || loc.state}
                    </Text>
                    {loc.population ? (
                      <Text style={styles.locationPopulation}>
                        {loc.population > 1000000 ? `${(loc.population / 1000000).toFixed(1)}M` : loc.population > 1000 ? `${Math.round(loc.population / 1000)}K` : ''}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
          <Text style={styles.resultsText}>{t('search.resultCount', { shown: jobs.length, total: totalCount })}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
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
          return <JobCard job={item as JobListing} onPress={handleJobPress} />;
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
    </KeyboardAvoidingView>
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
  filtersPanel: {
    paddingBottom: 8,
  },
  clearAllBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.danger + '15',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
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
  filterGroup: {
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  salaryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  salaryInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
  },
  salaryDash: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  locationInput: {
    fontSize: 14,
    color: Colors.text,
  },
  locationDropdown: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  locationOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  locationPopulation: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sortSection: {
    marginBottom: 12,
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
