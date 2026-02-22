import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ApexLogo from '@/components/ApexLogo';
import GoogleIcon from '@/components/GoogleIcon';
import { useAuth } from '@/contexts/AuthContext';
import { coachLogin } from '@/services/coach';
import { useGoogleAuth, googleLogin } from '@/services/google-auth';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

export default function CoachLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { request, response, promptAsync } = useGoogleAuth();

  const isValid = isValidEmail(email) && password.length > 0;

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleSignIn(idToken);
      } else {
        setError('Failed to get Google credentials. Please try again.');
        setIsGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
      setIsGoogleLoading(false);
    } else if (response?.type === 'dismiss') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setIsGoogleLoading(true);
    setError('');
    setSetupRequired(false);

    try {
      const result = await googleLogin(idToken);

      if (result.success && result.data) {
        await auth.loginAsCoach(result.data.token, result.data.coach);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(coach)');
      } else if (result.code === 'SETUP_REQUIRED') {
        setSetupRequired(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Google sign-in failed.');
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!isValid || isSubmitting) return;

    setError('');
    setSetupRequired(false);
    setIsSubmitting(true);

    try {
      const result = await coachLogin(email.trim().toLowerCase(), password);

      if (result.success && result.data) {
        await auth.loginAsCoach(result.data.token, result.data.coach);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(coach)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Invalid email or password.');
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={28} color={DS_COLORS.text.onGradient} />
          </TouchableOpacity>

          <View style={styles.header}>
            <ApexLogo size={80} />
            <Text style={styles.heading}>Coach Sign In</Text>
          </View>

          <View style={styles.card}>
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {
                setIsGoogleLoading(true);
                setError('');
                setSetupRequired(false);
                promptAsync();
              }}
              disabled={!request || isGoogleLoading || isSubmitting}
              activeOpacity={0.8}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={DS_COLORS.text.primary} />
              ) : (
                <View style={styles.googleButtonContent}>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="coach@school.edu"
                placeholderTextColor={DS_COLORS.input.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isSubmitting && !isGoogleLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={DS_COLORS.input.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  editable={!isSubmitting && !isGoogleLoading}
                  onSubmitEditing={handleSignIn}
                  returnKeyType="go"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={DS_COLORS.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {setupRequired ? (
              <View style={styles.setupCard}>
                <Text style={styles.setupTitle}>Welcome to CoachIQ!</Text>
                <Text style={styles.setupMessage}>
                  Set up your team on the web to get started.
                </Text>
                <TouchableOpacity
                  style={styles.setupLink}
                  onPress={() => Linking.openURL('https://v0-coach-iq-app-build.vercel.app')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.setupLinkText}>Open coachiq.com</Text>
                  <Ionicons name="open-outline" size={16} color={DS_COLORS.accent.green} />
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.signInButton,
                !isValid && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!isValid || isSubmitting || isGoogleLoading}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color={DS_COLORS.button.primaryText} />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Don&apos;t have an account? Visit coachiq.com
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DS_SPACING.xxl,
  },
  backButton: {
    marginTop: DS_SPACING.md,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: DS_SPACING.xxxl,
    marginBottom: DS_SPACING.xxxl,
  },
  heading: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
    marginTop: DS_SPACING.lg,
  },
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.xxl,
    ...DS_SHADOWS.elevated,
  },
  googleButton: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.md,
    borderWidth: 1,
    borderColor: DS_COLORS.input.border,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DS_SPACING.lg,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.text.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DS_SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DS_COLORS.input.border,
  },
  dividerText: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    paddingHorizontal: DS_SPACING.md,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: DS_SPACING.xl,
  },
  inputLabel: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    marginBottom: DS_SPACING.sm,
  },
  input: {
    ...DS_TYPOGRAPHY.inputText,
    borderWidth: 1,
    borderColor: DS_COLORS.input.border,
    borderRadius: DS_RADIUS.md,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.md,
    color: DS_COLORS.text.primary,
    backgroundColor: DS_COLORS.surface.card,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: DS_SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.status.error,
    marginBottom: DS_SPACING.lg,
  },
  setupCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: DS_RADIUS.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: DS_SPACING.lg,
    marginBottom: DS_SPACING.lg,
    alignItems: 'center',
  },
  setupTitle: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.xs,
  },
  setupMessage: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: DS_SPACING.md,
  },
  setupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setupLinkText: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.accent.green,
  },
  signInButton: {
    backgroundColor: DS_COLORS.accent.green,
    borderRadius: DS_RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonDisabled: {
    backgroundColor: DS_COLORS.button.disabledBackground,
  },
  signInButtonText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.button.primaryText,
  },
  footerText: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.onGradient,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: DS_SPACING.xxl,
  },
});
