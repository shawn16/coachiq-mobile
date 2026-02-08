import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // TEMPORARY: redirect to pin-login for testing (change back to setup when done)
  return <Redirect href="/(auth)/pin-login" />;
}
