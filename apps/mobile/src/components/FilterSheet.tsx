import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Company } from '../api/companies';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  companies: Company[];
  sectors: string[];
  selectedCompanyId: string | undefined;
  selectedSector: string | undefined;
  selectedSort: string;
  onCompanyChange: (id: string | undefined) => void;
  onSectorChange: (sector: string | undefined) => void;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni', icon: 'time-outline' as const },
  { value: 'deadline', label: 'Son Başvuru', icon: 'alarm-outline' as const },
  { value: 'salary_high', label: 'En Yüksek Maaş', icon: 'trending-up-outline' as const },
];

export default function FilterSheet({
  companies, sectors,
  selectedCompanyId, selectedSector, selectedSort,
  onCompanyChange, onSectorChange, onSortChange,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Sort */}
      <Text style={styles.sectionTitle}>Sıralama</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, selectedSort === opt.value && styles.chipActive]}
            onPress={() => onSortChange(opt.value)}
          >
            <Ionicons
              name={opt.icon}
              size={14}
              color={selectedSort === opt.value ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.chipText, selectedSort === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sectors */}
      <Text style={styles.sectionTitle}>Sektör</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedSector && styles.chipActive]}
          onPress={() => onSectorChange(undefined)}
        >
          <Text style={[styles.chipText, !selectedSector && styles.chipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {sectors.map((sector) => (
          <TouchableOpacity
            key={sector}
            style={[styles.chip, selectedSector === sector && styles.chipActive]}
            onPress={() => onSectorChange(selectedSector === sector ? undefined : sector)}
          >
            <Text style={[styles.chipText, selectedSector === sector && styles.chipTextActive]}>
              {sector}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Companies */}
      <Text style={styles.sectionTitle}>Firma</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedCompanyId && styles.chipActive]}
          onPress={() => onCompanyChange(undefined)}
        >
          <Text style={[styles.chipText, !selectedCompanyId && styles.chipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {companies.map((company) => (
          <TouchableOpacity
            key={company.id}
            style={[styles.chip, selectedCompanyId === company.id && styles.chipActive]}
            onPress={() => onCompanyChange(selectedCompanyId === company.id ? undefined : company.id)}
          >
            <Text style={[styles.chipText, selectedCompanyId === company.id && styles.chipTextActive]}>
              {company.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});
