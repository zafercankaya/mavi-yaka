import { useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Pressable, TextInput, ScrollView, Alert, Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, Trash2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { fetchJobAlerts, createJobAlert, toggleJobAlert, deleteJobAlert, JobAlert, CreateJobAlertInput } from '../src/api/job-alerts';
import { useAuthStore } from '../src/store/auth';
import { FilterChip } from '../src/components/FilterChip';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

const JOB_TYPE_KEYS = ['FULL_TIME', 'PART_TIME', 'DAILY', 'SEASONAL', 'INTERNSHIP', 'CONTRACT'] as const;
const WORK_MODE_KEYS = ['ON_SITE', 'REMOTE', 'HYBRID'] as const;

const SECTOR_KEYS = [
  'LOGISTICS_TRANSPORTATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION',
  'FOOD_BEVERAGE', 'AUTOMOTIVE', 'TEXTILE', 'MINING_ENERGY',
  'HEALTHCARE', 'HOSPITALITY_TOURISM', 'AGRICULTURE', 'SECURITY_SERVICES',
  'FACILITY_MANAGEMENT', 'METAL_STEEL', 'CHEMICALS_PLASTICS', 'ECOMMERCE_CARGO',
  'TELECOMMUNICATIONS', 'OTHER',
] as const;

export default function JobAlertsScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [sector, setSector] = useState<string | undefined>();
  const [jobType, setJobType] = useState<string | undefined>();
  const [workMode, setWorkMode] = useState<string | undefined>();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minSalary, setMinSalary] = useState('');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: fetchJobAlerts,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: createJobAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      resetForm();
      setShowForm(false);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.error'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleJobAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
    },
  });

  const resetForm = () => {
    setName('');
    setSector(undefined);
    setJobType(undefined);
    setWorkMode(undefined);
    setState('');
    setCity('');
    setKeywords('');
    setMinSalary('');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const input: CreateJobAlertInput = {
      name: name.trim(),
    };
    if (sector) input.sector = sector;
    if (jobType) input.jobType = jobType;
    if (workMode) input.workMode = workMode;
    if (state.trim()) input.state = state.trim();
    if (city.trim()) input.city = city.trim();
    if (keywords.trim()) input.keywords = keywords.trim();
    const salary = parseInt(minSalary, 10);
    if (salary > 0) input.minSalary = salary;
    createMutation.mutate(input);
  };

  const handleDelete = (alertId: string) => {
    Alert.alert(
      t('alerts.delete'),
      t('alerts.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('alerts.delete'), style: 'destructive', onPress: () => deleteMutation.mutate(alertId) },
      ],
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ title: t('alerts.title') }} />
        <View style={styles.center}>
          <Bell size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>{t('alerts.title')}</Text>
          <Text style={styles.emptyHint}>{t('guest.featureRequiresAccount')}</Text>
        </View>
      </>
    );
  }

  const renderAlert = ({ item }: { item: JobAlert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <Bell size={16} color={item.isActive ? Colors.primary : Colors.textTertiary} />
          <Text style={styles.alertName}>{item.name}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleMutation.mutate(item.id)}
          trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
          thumbColor={item.isActive ? Colors.primary : Colors.textTertiary}
        />
      </View>

      <View style={styles.alertTags}>
        {item.sector && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{t(`sector.${item.sector}`, item.sector)}</Text>
          </View>
        )}
        {item.jobType && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{t(`jobType.${item.jobType}`, item.jobType)}</Text>
          </View>
        )}
        {item.workMode && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{t(`workMode.${item.workMode}`, item.workMode)}</Text>
          </View>
        )}
        {item.city && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{item.city}</Text>
          </View>
        )}
        {item.state && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{item.state}</Text>
          </View>
        )}
        {item.keywords && (
          <View style={styles.alertTag}>
            <Text style={styles.alertTagText}>{item.keywords}</Text>
          </View>
        )}
      </View>

      {item.matchCount !== undefined && (
        <Text style={styles.matchCount}>{t('alerts.matchCount', { count: item.matchCount })}</Text>
      )}

      <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Trash2 size={14} color={Colors.danger} />
        <Text style={styles.deleteText}>{t('alerts.delete')}</Text>
      </Pressable>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('alerts.title') }} />
      <View style={styles.container}>
        {/* Create button */}
        <Pressable
          style={styles.createBtn}
          onPress={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <X size={18} color={Colors.white} />
          ) : (
            <Plus size={18} color={Colors.white} />
          )}
          <Text style={styles.createBtnText}>
            {showForm ? t('common.cancel') : t('alerts.create')}
          </Text>
        </Pressable>

        {/* Create form */}
        {showForm && (
          <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
            {/* Name */}
            <Text style={styles.formLabel}>{t('alerts.name')}</Text>
            <TextInput
              style={styles.formInput}
              placeholder={t('alerts.namePlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            {/* Sector */}
            <Text style={styles.formLabel}>{t('filter.sector')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {SECTOR_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`sector.${key}`)}
                  selected={sector === key}
                  onPress={() => setSector(sector === key ? undefined : key)}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>

            {/* Job Type */}
            <Text style={styles.formLabel}>{t('filter.jobType')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {JOB_TYPE_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`jobType.${key}`)}
                  selected={jobType === key}
                  onPress={() => setJobType(jobType === key ? undefined : key)}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>

            {/* Work Mode */}
            <Text style={styles.formLabel}>{t('filter.workMode')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {WORK_MODE_KEYS.map((key) => (
                <FilterChip
                  key={key}
                  label={t(`workMode.${key}`)}
                  selected={workMode === key}
                  onPress={() => setWorkMode(workMode === key ? undefined : key)}
                  color={Colors.primary}
                />
              ))}
            </ScrollView>

            {/* Location */}
            <Text style={styles.formLabel}>{t('filter.location')}</Text>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formInput, { flex: 1 }]}
                placeholder={t('filter.state')}
                placeholderTextColor={Colors.textTertiary}
                value={state}
                onChangeText={setState}
              />
              <TextInput
                style={[styles.formInput, { flex: 1 }]}
                placeholder={t('filter.city')}
                placeholderTextColor={Colors.textTertiary}
                value={city}
                onChangeText={setCity}
              />
            </View>

            {/* Keywords */}
            <Text style={styles.formLabel}>{t('alerts.keywords')}</Text>
            <TextInput
              style={styles.formInput}
              placeholder={t('alerts.keywordsPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              value={keywords}
              onChangeText={setKeywords}
            />

            {/* Min Salary */}
            <Text style={styles.formLabel}>{t('alerts.minSalary')}</Text>
            <TextInput
              style={styles.formInput}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              value={minSalary}
              onChangeText={setMinSalary}
              keyboardType="numeric"
            />

            {/* Submit */}
            <Pressable
              style={[styles.submitBtn, !name.trim() && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{t('alerts.save')}</Text>
              )}
            </Pressable>
          </ScrollView>
        )}

        {/* Alerts list */}
        {!showForm && (
          <FlatList
            data={alerts ?? []}
            renderItem={renderAlert}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : (
                <View style={styles.center}>
                  <Bell size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyTitle}>{t('alerts.empty')}</Text>
                  <Text style={styles.emptyHint}>{t('alerts.emptyHint')}</Text>
                </View>
              )
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Create button
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  createBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },

  // Form
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  formLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  formInput: {
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipsRow: {
    gap: 0,
    paddingVertical: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },

  // Alert card
  alertCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  alertName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  alertTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  alertTag: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  alertTagText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  matchCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
  },
  deleteText: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: '600',
  },

  // Empty
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
