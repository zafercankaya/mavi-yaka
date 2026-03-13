import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useMarketStore, Market } from '../src/store/market';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

interface CountryItem {
  market: Market;
  flag: string;
  labelKey: string;
}

const COUNTRIES: CountryItem[] = [
  { market: 'AU', flag: '\u{1F1E6}\u{1F1FA}', labelKey: 'profile.australia' },
  { market: 'BR', flag: '\u{1F1E7}\u{1F1F7}', labelKey: 'profile.brazil' },
  { market: 'CA', flag: '\u{1F1E8}\u{1F1E6}', labelKey: 'profile.canada' },
  { market: 'DE', flag: '\u{1F1E9}\u{1F1EA}', labelKey: 'profile.germany' },
  { market: 'FR', flag: '\u{1F1EB}\u{1F1F7}', labelKey: 'profile.france' },
  { market: 'IN', flag: '\u{1F1EE}\u{1F1F3}', labelKey: 'profile.india' },
  { market: 'ID', flag: '\u{1F1EE}\u{1F1E9}', labelKey: 'profile.indonesia' },
  { market: 'IT', flag: '\u{1F1EE}\u{1F1F9}', labelKey: 'profile.italy' },
  { market: 'JP', flag: '\u{1F1EF}\u{1F1F5}', labelKey: 'profile.japan' },
  { market: 'MX', flag: '\u{1F1F2}\u{1F1FD}', labelKey: 'profile.mexico' },
  { market: 'PH', flag: '\u{1F1F5}\u{1F1ED}', labelKey: 'profile.philippines' },
  { market: 'RU', flag: '\u{1F1F7}\u{1F1FA}', labelKey: 'profile.russia' },
  { market: 'TH', flag: '\u{1F1F9}\u{1F1ED}', labelKey: 'profile.thailand' },
  { market: 'TR', flag: '\u{1F1F9}\u{1F1F7}', labelKey: 'profile.turkey' },
  { market: 'UK', flag: '\u{1F1EC}\u{1F1E7}', labelKey: 'profile.uk' },
  { market: 'US', flag: '\u{1F1FA}\u{1F1F8}', labelKey: 'profile.usa' },
  { market: 'ES', flag: '\u{1F1EA}\u{1F1F8}', labelKey: 'profile.spain' },
  { market: 'EG', flag: '\u{1F1EA}\u{1F1EC}', labelKey: 'profile.egypt' },
  { market: 'SA', flag: '\u{1F1F8}\u{1F1E6}', labelKey: 'profile.saudiarabia' },
  { market: 'KR', flag: '\u{1F1F0}\u{1F1F7}', labelKey: 'profile.southkorea' },
  { market: 'AR', flag: '\u{1F1E6}\u{1F1F7}', labelKey: 'profile.argentina' },
  { market: 'AE', flag: '\u{1F1E6}\u{1F1EA}', labelKey: 'profile.uae' },
  { market: 'VN', flag: '\u{1F1FB}\u{1F1F3}', labelKey: 'profile.vietnam' },
  { market: 'PL', flag: '\u{1F1F5}\u{1F1F1}', labelKey: 'profile.poland' },
  { market: 'MY', flag: '\u{1F1F2}\u{1F1FE}', labelKey: 'profile.malaysia' },
  { market: 'CO', flag: '\u{1F1E8}\u{1F1F4}', labelKey: 'profile.colombia' },
  { market: 'ZA', flag: '\u{1F1FF}\u{1F1E6}', labelKey: 'profile.south_africa' },
  { market: 'PT', flag: '\u{1F1F5}\u{1F1F9}', labelKey: 'profile.portugal' },
  { market: 'NL', flag: '\u{1F1F3}\u{1F1F1}', labelKey: 'profile.netherlands' },
  { market: 'PK', flag: '\u{1F1F5}\u{1F1F0}', labelKey: 'profile.pakistan' },
  { market: 'SE', flag: '\u{1F1F8}\u{1F1EA}', labelKey: 'profile.sweden' },
];

export default function SelectCountryScreen() {
  const { t } = useTranslation();
  const { market, setMarket } = useMarketStore();

  // Sort alphabetically by translated name
  const sorted = [...COUNTRIES].sort((a, b) =>
    t(a.labelKey).localeCompare(t(b.labelKey))
  );

  const handleSelect = async (selected: Market) => {
    await setMarket(selected);
    router.back();
  };

  const renderItem = ({ item }: { item: CountryItem }) => {
    const isSelected = item.market === market;
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => handleSelect(item.market)}
        activeOpacity={0.6}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {t(item.labelKey)}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('profile.country') }} />
      <View style={styles.container}>
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.market}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  itemSelected: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  flag: { fontSize: 28 },
  label: { fontSize: FontSize.md, color: Colors.text, flex: 1 },
  labelSelected: { fontWeight: '600', color: Colors.primary },
  separator: { height: 1, backgroundColor: Colors.surfaceVariant },
});
