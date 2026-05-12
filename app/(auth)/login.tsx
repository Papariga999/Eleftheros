import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { BoltIcon, EyeIcon } from '../../components/Icons';
import AppTextInput from '../../components/AppTextInput';
import PrimaryBtn from '../../components/PrimaryBtn';
import TopNav from '../../components/TopNav';
import { auth as authApi, setToken } from '../../services/api';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { isAppleAuthAvailable, signInWithApple } from '../../hooks/useAppleAuth';

export default function LoginScreen() {
  const { lang, login } = useApp();
  const isEL = lang === 'el';

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const google = useGoogleAuth({
    onSuccess: () => { login(); router.replace('/(tabs)'); },
    onError: msg => setError(msg),
  });

  const handleSubmit = async () => {
    if (!email || !pw) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password: pw });
      await setToken(res.token);
      login();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? (isEL ? 'Λάθος στοιχεία' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav title={isEL ? 'Σύνδεση' : 'Sign in'} onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.wordmarkRow}>
          <View style={styles.iconCircle}>
            <BoltIcon size={22} stroke="#fff" fill="none" strokeWidth={2} />
          </View>
          <Text style={styles.wordmark}>ελεύθερος</Text>
        </View>

        <Text style={styles.heading}>{isEL ? 'Καλώς ήρθατε πίσω' : 'Welcome back'}</Text>
        <Text style={styles.subheading}>{isEL ? 'Συνδεθείτε για να συνεχίσετε' : 'Sign in to continue'}</Text>

        <View style={styles.form}>
          <AppTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <AppTextInput
            value={pw} onChangeText={setPw}
            placeholder={isEL ? 'Κωδικός πρόσβασης' : 'Password'}
            secureTextEntry={!showPw}
            trailing={
              <TouchableOpacity onPress={() => setShowPw(p => !p)}>
                <EyeIcon size={18} stroke={C.inkSoft} />
              </TouchableOpacity>
            }
          />
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgot}>{isEL ? 'Ξεχάσατε τον κωδικό;' : 'Forgot password?'}</Text>
          </TouchableOpacity>
          {error ? (
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.danger, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
          <PrimaryBtn onPress={handleSubmit} loading={loading}>{isEL ? 'Σύνδεση' : 'Sign in'}</PrimaryBtn>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>{isEL ? 'ή' : 'or'}</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.social}>
          {google.configured && (
            <TouchableOpacity style={[styles.googleBtn, google.disabled && { opacity: 0.5 }]} onPress={() => google.promptAsync()} disabled={google.disabled}>
              <Text style={styles.googleLabel}>{isEL ? 'Συνέχεια με Google' : 'Continue with Google'}</Text>
            </TouchableOpacity>
          )}
          {isAppleAuthAvailable && (
            <TouchableOpacity style={styles.appleBtn} onPress={() => signInWithApple({
              onSuccess: () => { login(); router.replace('/(tabs)'); },
              onError: msg => setError(msg),
            })}>
              <Text style={styles.appleLabel}>{isEL ? 'Συνέχεια με Apple' : 'Continue with Apple'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{isEL ? 'Νέος χρήστης; ' : 'New here? '}</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={styles.footerLink}>{isEL ? 'Δημιουργία Λογαριασμού →' : 'Create account →'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 18 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 99, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  wordmark: { fontFamily: 'Newsreader_500Medium', fontSize: 24, color: C.primary, letterSpacing: -0.4 },
  heading: { fontFamily: 'Manrope_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3, textAlign: 'center' },
  subheading: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkSoft, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  form: { gap: 12 },
  forgotWrap: { alignSelf: 'flex-end' },
  forgot: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: C.primary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: C.inkFaint },
  social: { gap: 10 },
  googleBtn: {
    height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#e2ddd6',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  googleLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: C.ink },
  appleBtn: {
    height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#e2ddd6',
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
  },
  appleLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkSoft },
  footerLink: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: C.primary },
});
