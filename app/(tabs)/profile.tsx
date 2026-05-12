import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import EditProfileScreen from '../../components/EditProfileScreen';
import {
  AlertIcon,
  BoltIcon,
  ChevronRightIcon,
  InvoiceIcon,
  LockIcon,
  OtherIcon,
  PersonIcon,
  SunIcon,
} from '../../components/Icons';
import ProUpgradeSheet from '../../components/ProUpgradeSheet';
import SectionHeader from '../../components/SectionHeader';
import { C } from '../../constants/theme';
import { STR } from '../../constants/strings';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { lang, setLang, logout, showPro, setShowPro, editingProfile, setEditingProfile } = useApp();
  const t = STR[lang];
  const isEL = lang === 'el';

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const accountRows = [
    { Icon: PersonIcon,  label: isEL ? 'Προσωπικά Στοιχεία'    : 'Personal Details' },
    { Icon: InvoiceIcon, label: isEL ? 'Στοιχεία Επιχείρησης'  : 'Business Details' },
    { Icon: LockIcon,    label: isEL ? 'Κωδικός & Ασφάλεια'    : 'Password & Security' },
    { Icon: AlertIcon,   label: isEL ? 'Ειδοποιήσεις'          : 'Notifications' },
  ];

  const appRows = [
    { Icon: SunIcon,     label: isEL ? 'Γλώσσα'              : 'Language',          value: isEL ? 'Ελληνικά' : 'English' },
    { Icon: InvoiceIcon, label: isEL ? 'Λογιστής / Εξαγωγή' : 'Accountant Export' },
    { Icon: OtherIcon,   label: isEL ? 'Βοήθεια & Υποστήριξη' : 'Help & Support'  },
    { Icon: BoltIcon,    label: isEL ? 'Αξιολογήστε μας'    : 'Rate us'            },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isEL ? 'ΛΟΓΑΡΙΑΣΜΟΣ' : 'ACCOUNT'}</Text>
          <Text style={styles.title}>{isEL ? 'Προφίλ' : 'Profile'}</Text>
        </View>

        {/* Profile hero card */}
        <View style={styles.px}>
          <Card style={styles.heroCard}>
            <TouchableOpacity onPress={() => setEditingProfile(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>{isEL ? 'Επεξεργασία' : 'Edit'}</Text>
            </TouchableOpacity>
            <View style={styles.heroRow}>
              <Avatar initials="ΓΠ" size={64} />
              <View style={{ flex: 1, minWidth: 0, paddingRight: 80 }}>
                <Text style={styles.heroName}>{isEL ? 'Γιώργης Παπαδόπουλος' : 'George Papadopoulos'}</Text>
                <Text style={styles.heroAfm}>{isEL ? 'ΑΦΜ: 123456789' : 'VAT ID: 123456789'}</Text>
                <Text style={styles.heroEmail}>georgios@email.com</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Plan row */}
        <View style={[styles.px, { marginBottom: 4 }]}>
          <TouchableOpacity onPress={() => setShowPro(true)} style={styles.planRow}>
            <View style={styles.planIcon}>
              <BoltIcon size={15} stroke={C.primary} fill={C.primary} strokeWidth={2} />
            </View>
            <Text style={styles.planName}>Starter Plan</Text>
            <View style={styles.planUpgrade}>
              <Text style={styles.planUpgradeText}>{isEL ? 'Αναβάθμιση σε Pro' : 'Upgrade to Pro'}</Text>
              <ChevronRightIcon size={14} stroke={C.primary} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        <SectionHeader>{isEL ? 'ΛΟΓΑΡΙΑΣΜΟΣ' : 'ACCOUNT'}</SectionHeader>
        <SettingsGroup items={accountRows} />

        <SectionHeader>{isEL ? 'ΕΦΑΡΜΟΓΗ' : 'APP'}</SectionHeader>
        <SettingsGroup items={appRows} />

        <View style={[styles.px, { marginTop: 18 }]}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutLabel}>↩  {isEL ? 'Αποσύνδεση' : 'Sign out'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {editingProfile && <EditProfileScreen lang={lang} onClose={() => setEditingProfile(false)} />}
      {showPro && <ProUpgradeSheet lang={lang} onClose={() => setShowPro(false)} />}
    </SafeAreaView>
  );
}

function SettingsGroup({ items }: { items: { Icon: React.ComponentType<any>; label: string; value?: string }[] }) {
  return (
    <View style={styles.px}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <TouchableOpacity key={i} style={[styles.settingsRow, i < items.length - 1 && styles.settingsBorder]}>
            <View style={styles.settingsIcon}>
              <it.Icon size={18} stroke={C.primary} strokeWidth={1.7} />
            </View>
            <Text style={styles.settingsLabel}>{it.label}</Text>
            {it.value && <Text style={styles.settingsValue}>{it.value}</Text>}
            <ChevronRightIcon size={16} stroke={C.inkFaint} strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 110 },
  px: { paddingHorizontal: 22 },
  header: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 14 },
  eyebrow: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: C.inkSoft, letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { fontFamily: 'Newsreader_500Medium', fontSize: 24, color: C.ink, letterSpacing: -0.3, marginTop: 2 },
  heroCard: { padding: 20, position: 'relative' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  editBtn: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.primary,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  editBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.primary },
  heroName: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: C.ink, lineHeight: 21 },
  heroAfm: { fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.inkSoft, marginTop: 3 },
  heroEmail: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: C.inkFaint, marginTop: 1 },
  planRow: {
    backgroundColor: C.primarySoft, borderRadius: 14,
    padding: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: C.primaryGlow,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  planIcon: { width: 28, height: 28, borderRadius: 99, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  planName: { flex: 1, fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.ink },
  planUpgrade: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planUpgradeText: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: C.primary },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14 },
  settingsBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  settingsIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.cardSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingsLabel: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: C.ink },
  settingsValue: { fontFamily: 'Manrope_500Medium', fontSize: 12.5, color: C.inkFaint },
  logoutBtn: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: C.dangerSoft,
    padding: 14, paddingHorizontal: 16, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutLabel: { fontFamily: 'Manrope_700Bold', fontSize: 14.5, color: C.danger },
});
