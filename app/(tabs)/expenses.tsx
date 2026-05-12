import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import {
  CameraIcon,
  EquipIcon,
  OfficeIcon,
  OtherIcon,
  PencilIcon,
  SoftwareIcon,
  TransitIcon,
} from '../../components/Icons';
import { C } from '../../constants/theme';
import { STR } from '../../constants/strings';
import { useApp } from '../../context/AppContext';
import { eur } from '../../utils/currency';
import { type Expense, expenses as expensesApi } from '../../services/api';

const CAT_COLOR: Record<string, { fg: string; soft: string }> = {
  software:  { fg: '#5a4ec9', soft: '#ebe8fb' },
  equipment: { fg: '#a8542b', soft: '#fbe9dd' },
  transport: { fg: '#1c7a86', soft: '#dff1f3' },
  office:    { fg: '#8a5a14', soft: '#fbeed0' },
  other:     { fg: '#5d6862', soft: '#ece8df' },
};

const CAT_ICON: Record<string, React.ComponentType<{ size: number; stroke: string }>> = {
  software:  SoftwareIcon,
  equipment: EquipIcon,
  transport: TransitIcon,
  office:    OfficeIcon,
  other:     OtherIcon,
};

const MONTHS_EL = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso: string, lang: 'el' | 'en'): string {
  const d = new Date(iso);
  const months = lang === 'el' ? MONTHS_EL : MONTHS_EN;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function ExpensesScreen() {
  const { lang, setLang } = useApp();
  const t = STR[lang];
  const [cat, setCat] = useState('all');
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setExpenseList(await expensesApi.list());
    } catch { /* show empty state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cats = [
    { k: 'all',       label: t.catAll       },
    { k: 'software',  label: t.catSoftware  },
    { k: 'equipment', label: t.catEquipment },
    { k: 'transport', label: t.catTransport },
    { k: 'office',    label: t.catOffice    },
    { k: 'other',     label: t.catOther     },
  ];

  const catLabel: Record<string, string> = {
    software: t.catSoftware, equipment: t.catEquipment,
    transport: t.catTransport, office: t.catOffice, other: t.catOther,
  };

  const now = new Date();
  const currentMonth = `${lang === 'el' ? MONTHS_EL[now.getMonth()] : MONTHS_EN[now.getMonth()]} ${now.getFullYear()}`;
  const filtered = cat === 'all' ? expenseList : expenseList.filter(e => e.category === cat);
  const total = filtered.reduce((a, e) => a + e.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppHeader
          lang={lang} setLang={setLang}
          subtitle={currentMonth}
          title={t.expensesTitle}
        />

        {/* Capture buttons */}
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.photoBtn}>
            <View style={styles.photoIcon}>
              <CameraIcon size={20} stroke="#fff" strokeWidth={1.8} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={styles.photoBtnLabel}>{t.photoReceipt}</Text>
              <Text style={styles.photoBtnSub}>⚡ {t.photoSub}</Text>
            </View>
            <View style={styles.photoBtnOrb} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualBtn}>
            <View style={styles.manualIcon}>
              <PencilIcon size={17} stroke={C.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.manualLabel}>{t.manual}</Text>
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {cats.map(c => (
            <TouchableOpacity key={c.k} onPress={() => setCat(c.k)}
              style={[styles.chip, cat === c.k && styles.chipActive]}>
              <Text style={[styles.chipLabel, cat === c.k && styles.chipLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expense list */}
        <View style={styles.px}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color={C.primary} />
              </View>
            ) : filtered.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkFaint }}>
                  {lang === 'el' ? 'Δεν υπάρχουν έξοδα ακόμα' : 'No expenses yet'}
                </Text>
              </View>
            ) : filtered.map((e, i) => {
              const cc = CAT_COLOR[e.category] ?? CAT_COLOR.other;
              const Icon = CAT_ICON[e.category] ?? OtherIcon;
              return (
                <View key={e.id} style={[styles.expRow, i < filtered.length - 1 && styles.expBorder]}>
                  <View style={[styles.expIcon, { backgroundColor: cc.soft }]}>
                    <Icon size={19} stroke={cc.fg} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.expName} numberOfLines={1}>{e.name}</Text>
                    <View style={styles.expMeta}>
                      <View style={[styles.catBadge, { backgroundColor: cc.soft }]}>
                        <Text style={[styles.catBadgeText, { color: cc.fg }]}>{catLabel[e.category]}</Text>
                      </View>
                      <Text style={styles.expDate}>{fmtDate(e.date, lang)}</Text>
                    </View>
                  </View>
                  <Text style={styles.expAmount}>−{eur(e.amount, lang)}</Text>
                </View>
              );
            })}
          </Card>

          {/* Total */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>{t.expensesMonth.toUpperCase()}</Text>
              <Text style={styles.totalEntries}>
                {filtered.length} {lang === 'el' ? 'καταχωρήσεις' : 'entries'}
              </Text>
            </View>
            <Text style={styles.totalAmount}>{eur(total, lang)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 110 },
  px: { paddingHorizontal: 22 },
  captureRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, marginBottom: 14 },
  photoBtn: {
    flex: 1.6, height: 96, borderRadius: 20, backgroundColor: C.primary,
    padding: 14, justifyContent: 'space-between', overflow: 'hidden', position: 'relative',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8,
  },
  photoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  photoBtnLabel: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff', letterSpacing: -0.1 },
  photoBtnSub: { fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  photoBtnOrb: {
    position: 'absolute', right: -10, bottom: -10, width: 80, height: 80,
    borderRadius: 99, backgroundColor: 'rgba(217,119,87,0.18)',
  },
  manualBtn: {
    flex: 1, height: 96, borderRadius: 20, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, padding: 14, justifyContent: 'space-between',
    shadowColor: 'rgba(20,30,25,1)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  manualIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  manualLabel: { fontFamily: 'Manrope_700Bold', fontSize: 13, color: C.ink, lineHeight: 17 },
  chips: { paddingHorizontal: 22, gap: 7, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, color: C.ink },
  chipLabelActive: { color: '#fff' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingVertical: 12 },
  expBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  expIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expName: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, color: C.ink },
  expMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  catBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10.5 },
  expDate: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, color: C.inkFaint },
  expAmount: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.ink },
  totalCard: {
    marginTop: 12, padding: 14, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  totalLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10.5, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.4 },
  totalEntries: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  totalAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: '#fff', letterSpacing: -0.6 },
});
