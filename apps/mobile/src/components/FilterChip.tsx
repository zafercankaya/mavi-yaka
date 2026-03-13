import React, { useRef, useCallback } from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Colors } from '../constants/theme';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

function FilterChipInner({ label, selected, onPress, color }: FilterChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const activeColor = color ?? Colors.primary;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.chip,
          selected
            ? { backgroundColor: activeColor, borderColor: activeColor }
            : { backgroundColor: Colors.surface, borderColor: Colors.border },
        ]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#fff' : Colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export const FilterChip = React.memo(FilterChipInner);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
