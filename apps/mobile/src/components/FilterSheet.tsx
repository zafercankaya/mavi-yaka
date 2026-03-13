import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Category } from '../api/brands';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  brands: Brand[];
  categories: Category[];
  selectedBrandId: string | undefined;
  selectedCategoryId: string | undefined;
  selectedSort: string;
  onBrandChange: (id: string | undefined) => void;
  onCategoryChange: (id: string | undefined) => void;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni', icon: 'time-outline' as const },
  { value: 'ending_soon', label: 'Bitmek Üzere', icon: 'alarm-outline' as const },
  { value: 'discount_high', label: 'En Yüksek İndirim', icon: 'trending-down-outline' as const },
];

export default function FilterSheet({
  brands, categories,
  selectedBrandId, selectedCategoryId, selectedSort,
  onBrandChange, onCategoryChange, onSortChange,
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

      {/* Categories */}
      <Text style={styles.sectionTitle}>Kategori</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategoryId && styles.chipActive]}
          onPress={() => onCategoryChange(undefined)}
        >
          <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
            onPress={() => onCategoryChange(selectedCategoryId === cat.id ? undefined : cat.id)}
          >
            <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Brands */}
      <Text style={styles.sectionTitle}>Marka</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedBrandId && styles.chipActive]}
          onPress={() => onBrandChange(undefined)}
        >
          <Text style={[styles.chipText, !selectedBrandId && styles.chipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {brands.map((brand) => (
          <TouchableOpacity
            key={brand.id}
            style={[styles.chip, selectedBrandId === brand.id && styles.chipActive]}
            onPress={() => onBrandChange(selectedBrandId === brand.id ? undefined : brand.id)}
          >
            <Text style={[styles.chipText, selectedBrandId === brand.id && styles.chipTextActive]}>
              {brand.name}
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
