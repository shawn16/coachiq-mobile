import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DS_COLORS, DS_TYPOGRAPHY } from '@/constants/design-system';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.title}>CoachIQ Mobile</Text>
        <Text style={styles.subtitle}>Dashboard coming soon</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.7,
    marginTop: 8,
  },
});
