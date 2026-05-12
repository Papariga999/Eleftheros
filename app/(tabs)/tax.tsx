import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import { AlertIcon } from '../../components/Icons';
import ProUpgradeSheet from '../../components/ProUpgradeSheet';
import { C } from '../../constants/theme';
import { STR } from '../../constants/strings';
import { useApp } from '../../context/AppContext';
import { eur } from '../../utils/currency';
import { type TaxOverview, tax as taxApi } from '../../services/api';

const MONTHS_EL = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TaxScreen() {
  const { lang, setLang, showPro, setShowPro } = useApp();
  const t = STR[lang];
  const [overview, setOverview] = useState<TaxOverview | null>(null);

  const load = useCallback(async () => {
    try { setOverview(await taxApi.overview()); } catch { /* keep null */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Last 6 months for bar chart
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, d };
  });
  const DATA = last6.map(({ month }) =>
    overview?.monthlyRevenue.find(m => m.month === month)?.amount ?? 0
  );
  const MAX = Math.max(...DATA, 1);
  const labels = last6.map(({ d }) =>
    lang === 'el' ? MONTHS_EL[d.getMonth()] : MONTHS_EN[d.getMonth()]
  );

  const vatAlertData = overview?.vatAlerts?.[0] ?? null;
  const yearProgress = overview ? Math.round(overview.yearProgressDays / 365 * 100) : 35;
  const subtitle = overview
    ? `${lang === 'el' ? 'Έτος' : 'Year'} ${overview.year}`
    : t.taxSubtitle;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppHeader lang={lang} setLang={setLang} subtitle={subtitle} title={t.taxTitle} />

        {/* VAT alert */}
        <View style={styles.px}>
          <View style={styles.vatAlert}>
            <View style={styles.alertIcon}>
              <AlertIcon size={18} stroke="#7a521b" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {vatAlertData
                  ? (lang === 'el'
                      ? `Προσοχή: ΦΠΑ απόδοση σε ${vatAlertData.daysRemaining} ημέρες`
                      : `Heads up: VAT return in ${vatAlertData.daysRemaining} days`)
                  : t.vatAlert}
              </Text>
              <Text style={styles.alertSub}>
                {vatAlertData
                  ? `${vatAlertData.period} — ${lang === 'el' ? 'λήξη' : 'due'} ${vatAlertData.dueDate}`
                  : t.vatAlertSub}
              </Text>
            </View>
            <TouchableOpacity style={styles.alertBtn}>
              <Text style={styles.alertBtnText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bar chart */}
        <View style={styles.px}>
          <Card>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{t.revenueLast6}</Text>
              <Text style={styles.chartTotal}>{eur(overview?.totalRevenue ?? 0, lang)}</Text>
            </View>
            <View style={styles.bars}>
              {DATA.map((v, i) => {
                const h = (v / MAX) * 90;
                const isLast = i === DATA.length - 1;
                const isPrev = i === DATA.length - 2;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barValue, { opacity: isLast ? 1 : 0 }]}>
                      €{(v / 1000).toFixed(1)}k
                    </Text>
                    <View style={styles.barTrack}>
                      <View style={[
                        styles.bar,
                        { height: h },
                        isLast && styles.barLast,
                        isPrev && styles.barPrev,
                        !isLast && !isPrev && styles.barOld,
                      ]} />
                    </View>
                    <Text style={[styles.barLabel, isLast && styles.barLabelActive]}>{labels[i]}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Tax breakdown */}
        <View style={[styles.px, styles.taxGrid]}>
          <Card style={[styles.taxCard, { flex: 1.25 }]}>
            <Text style={styles.taxCardLabel}>{t.estIncomeTax.toUpperCase()}</Text>
            <Text style={[styles.taxCardSub, { color: C.accent }]}>{t.quarter}</Text>
            <Text style={styles.taxCardAmount}>{eur(overview?.estimatedIncomeTax ?? 0, lang)}</Text>
            <View style={styles.bracketChip}>
              <View style={styles.bracketDot} />
              <Text style={styles.bracketText}>22%  ·  {lang === 'el' ? 'κλίμακα' : 'bracket'}</Text>
            </View>
          </Card>
          <Card style={[styles.taxCard, { flex: 1, backgroundColor: '#fbf7ee' }]}>
            <Text style={styles.taxCardLabel}>{t.efka.toUpperCase()}</Text>
            <Text style={[styles.taxCardSub, { color: C.inkFaint }]}>{t.efkaSub}</Text>
            <Text style={[styles.taxCardAmount, { fontSize: 24 }]}>{eur(overview?.efkaMonthly ?? 0, lang)}</Text>
            <Text style={[styles.bracketText, { marginTop: 8 }]}>{lang === 'el' ? 'Κατηγορία 2' : 'Category 2'}</Text>
          </Card>
        </View>

        {/* Year progress */}
        <View style={styles.px}>
          <Card>
            <View style={styles.progressHeader}>
              <Text style={styles.chartTitle}>{t.yearProgress}</Text>
              <Text style={styles.progressDays}>
                {overview
                  ? `${overview.yearProgressDays} / 365 ${lang === 'el' ? 'ημέρες' : 'days'}`
                  : t.daysIntoYear}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${yearProgress}%` as unknown as number }]} />
            </View>
            <View style={styles.progressMarkers}>
              {(lang === 'el' ? ['Ιαν', 'Απρ', 'Ιουλ', 'Οκτ', 'Δεκ'] : ['Jan', 'Apr', 'Jul', 'Oct', 'Dec']).map(m => (
                <Text key={m} style={styles.markerText}>{m}</Text>
              ))}
            </View>
          </Card>
        </View>

        {/* Pro lock */}
        <View style={styles.px}>
          <View style={styles.proCard}>
            <View style={styles.proDecor1} />
            <View style={styles.proDecor2} />
            <View style={styles.proRow}>
              <View style={styles.lockIcon}>
                <Text style={{ fontSize: 20 }}>🔒</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proTitle}>{t.proLockTitle}</Text>
                <Text style={styles.proBody}>{t.proLockBody}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowPro(true)} style={styles.proCta}>
              <Text style={styles.proCtaLabel}>{t.proCta} →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showPro && <ProUpgradeSheet lang={lang} onClose={() => setShowPro(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 110 },
  px: { paddingHorizontal: 22, marginBottom: 14 },
  vatAlert: {
    flexDirection: 'row', gap: 11, padding: 12, paddingHorizontal: 14,
    borderRadius: 16, backgroundColor: '#fbeed0', borderWidth: 1, borderColor: '#ecd49b',
    alignItems: 'center',
  },
  alertIcon: {
    width: 32, height: 32, borderRadius: 11, backgroundColor: '#ecd49b',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  alertTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, color: '#7a521b' },
  alertSub: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: '#9c6f29', marginTop: 1 },
  alertBtn: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ecd49b', borderRadius: 99,
    paddingHorizontal: 11, paddingVertical: 6,
  },
  alertBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 11.5, color: '#7a521b' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  chartTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, color: C.ink },
  chartTotal: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.primary },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 14 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' as unknown as number },
  barValue: { fontFamily: 'Manrope_700Bold', fontSize: 9.5, color: C.inkSoft },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, borderTopRightRadius: 4 },
  barLast: { backgroundColor: C.primary, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  barPrev: { backgroundColor: '#c7dcce' },
  barOld: { backgroundColor: '#dde7df' },
  barLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10.5, color: C.inkFaint },
  barLabelActive: { color: C.primary },
  taxGrid: { flexDirection: 'row', gap: 10 },
  taxCard: { padding: 14 },
  taxCardLabel: { fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.inkSoft, letterSpacing: 0.4 },
  taxCardSub: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, marginTop: 2 },
  taxCardAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 26, color: C.ink, letterSpacing: -0.6, marginTop: 10 },
  bracketChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, marginTop: 8,
    alignSelf: 'flex-start',
  },
  bracketDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: C.primary },
  bracketText: { fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.primary },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  progressDays: { fontFamily: 'Manrope_500Medium', fontSize: 11, color: C.inkSoft },
  progressTrack: { height: 10, backgroundColor: C.cardSoft, borderRadius: 99, overflow: 'hidden' },
  progressFill: { width: '35%', height: '100%', backgroundColor: C.primary, borderRadius: 99 },
  progressMarkers: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  markerText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: C.inkFaint },
  proCard: {
    borderRadius: 20, backgroundColor: '#1d2422', padding: 18,
    borderWidth: 1, borderColor: '#232b28', overflow: 'hidden', position: 'relative',
  },
  proDecor1: { position: 'absolute', top: 36, left: 18, height: 10, width: '70%', backgroundColor: '#cfe2d4', borderRadius: 4, opacity: 0.18 },
  proDecor2: { position: 'absolute', top: 56, left: 18, height: 10, width: '50%', backgroundColor: '#cfe2d4', borderRadius: 4, opacity: 0.18 },
  proRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lockIcon: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(217,119,87,0.22)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  proTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#fff' },
  proBody: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: 'rgba(255,255,255,0.66)', marginTop: 2 },
  proCta: {
    marginTop: 14, height: 44, borderRadius: 12, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  proCtaLabel: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, color: '#fff' },
});
