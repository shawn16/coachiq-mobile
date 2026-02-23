import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_RADIUS } from '@/constants/design-system';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ?? 'An unexpected error occurred.'}
          </Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>
              {this.state.error?.message ?? 'Unknown error'}
            </Text>
            <Text style={styles.stackText}>
              {this.state.error?.stack?.slice(0, 500) ?? ''}
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DS_SPACING.xxl,
    backgroundColor: DS_COLORS.surface.background,
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.md,
  },
  message: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: DS_SPACING.xl,
  },
  errorBox: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: DS_RADIUS.md,
    padding: DS_SPACING.lg,
    marginBottom: DS_SPACING.xl,
  },
  errorText: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.status.error,
    fontWeight: '600',
    marginBottom: DS_SPACING.sm,
  },
  stackText: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.secondary,
    fontSize: 10,
  },
  retryButton: {
    backgroundColor: DS_COLORS.accent.green,
    borderRadius: DS_RADIUS.lg,
    paddingHorizontal: DS_SPACING.xxxl,
    paddingVertical: DS_SPACING.md,
  },
  retryText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.button.primaryText,
  },
});
