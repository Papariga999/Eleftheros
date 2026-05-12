import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import { CalendarIcon, CheckIcon, RefreshIcon } from '../../components/Icons';
import { C } from '../../constants/theme';
import { STR } from '../../constants/strings';
import { useApp } from '../../context/AppContext';
import { eur } from '../../utils/currency';
import { type Invoice, invoices as invoicesApi } from '../../services/api';

const STATUS_COLOR = {
  paid:    { fg: C.primary,  soft: C.primarySoft  },
  pending: { fg: '#8a5a14', soft: C.warningSoft  },
  overdue: { fg: C.danger,  soft: C.dangerSoft   },
};

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function DashboardScreen() {
  const { lang, setLang } = useApp();
  const t = STR[lang];
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await invoicesApi.list();
      setInvoiceList(data.slice(0, 3));
    } catch { /* show empty state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const recent = invoiceList.slice(0, 3);
  const totalRevenue = invoiceList.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.totalNetValue, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <AppHeader lang={lang} setLang={setLang} subtitle={t.today} title={`${t.greetMorning}, ${t.name}`} />

        {/* myDATA sync banner */}
        <View style={styles.px}>
          <View style={styles.syncBanner}>
            <View style={styles.syncCheck}>
              <CheckIcon size={18} stroke="#fff" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncTitle}>{t.mydataSynced}</Text>
              <View style={styles.syncSubRow}>
                <RefreshIcon size={11} stroke="#3a7656" strokeWidth={2} />
                <Text style={styles.syncSub}>{t.mydataAgo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metric cards */}
        <View style={[styles.px, styles.metricsRow]}>
          <View style={[styles.metricCard, styles.metricPrimary]}>
            <View style={styles.accentOrb} />
            <Text style={[styles.metricLabel, { color: 'rgba(255,255,255,0.78)' }]}>{t.metricRevenue.toUpperCase()}</Text>
            <Text style={[styles.metricValue, { color: '#fff' }]}>{eur(totalRevenue, lang)}</Text>
            <Text style={[styles.metricSub, { color: 'rgba(255,255,255,0.72)' }]}>{invoiceList.length} {lang === 'el' ? 'τιμολόγια' : 'invoices'}</Text>
          </View>
          <View style={[styles.metricCard, styles.metricWhite]}>
            <Text style={styles.metricLabel}>{t.metricPending.toUpperCase()}</Text>
            <Text style={[styles.metricValue, { color: C.ink }]}>
              {eur(invoiceList.filter(i => i.status === 'draft').reduce((s, i) => s + i.totalGrossValue, 0), lang)}
            </Text>
            <Text style={[styles.metricSub, { color: C.accent }]}>{t.pendingSub}</Text>
          </View>
        </View>

        {/* Next obligation */}
        <View style={[styles.px, { marginTop: 10 }]}>
          <View style={styles.nextTaxRow}>
            <View style={styles.calIcon}>
              <CalendarIcon size={17} stroke="#8a5a14" strokeWidth={1.7} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextTaxLabel}>{t.metricNextTax.toUpperCase()}</Text>
              <Text style={styles.nextTaxSub}>{t.nextTaxSub}</Text>
            </View>
            <Text style={styles.nextTaxAmount}>€420</Text>
          </View>
        </View>

        {/* Recent invoices */}
        <View style={[styles.px, { marginTop: 20 }]}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{t.recentInvoices}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>{t.viewAll}</Text>
            </TouchableOpacity>
          </View>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color={C.primary} />
              </View>
            ) : recent.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: C.inkFaint }}>
                  {lang === 'el' ? 'Δεν υπάρχουν τιμολόγια ακόμα' : 'No invoices yet'}
                </Text>
              </View>
            ) : recent.map((inv, i) => {
              const status = inv.status === 'submitted' ? 'paid' : inv.status === 'draft' ? 'pending' : 'overdue';
              const sc = STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? STATUS_COLOR.pending;
              return (
                <View key={inv.id} style={[styles.invoiceRow, i < recent.length - 1 && styles.invoiceBorder]}>
                  <Avatar initials={initials(inv.clientName)} color={sc.fg} soft={sc.soft} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.invClient} numberOfLines={1}>{inv.clientName}</Text>
                    <Text style={styles.invMeta}>A/{inv.aa}  ·  {inv.issueDate}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.invAmount}>{eur(inv.totalGrossValue, lang)}</Text>
                    <Badge kind={status as 'paid' | 'pending' | 'overdue'}>{t[status as 'paid' | 'pending' | 'overdue']}</Badge>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 120 },
  px: { paddingHorizontal: 22 },
  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 16, backgroundColor: C.successSoft,
    borderWidth: 1, borderColor: '#cce6d4', marginBottom: 14,
  },
  syncCheck: {
    width: 30, height: 30, borderRadius: 99, backgroundColor: C.success,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  syncTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, color: '#0f5a32' },
  syncSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  syncSub: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: '#3a7656' },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1, borderRadius: 18, padding: 14, paddingBottom: 12,
    overflow: 'hidden', position: 'relative',
  },
  metricPrimary: {
    backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 8,
  },
  metricWhite: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    shadowColor: 'rgba(20,30,25,1)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  accentOrb: {
    position: 'absolute', right: -20, top: -20,
    width: 90, height: 90, borderRadius: 99,
    backgroundColor: 'rgba(217,119,87,0.18)',
  },
  metricLabel: {
    fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: C.inkSoft,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.6,
    marginTop: 8,
  },
  metricSub: {
    fontFamily: 'Manrope_600SemiBold', fontSize: 11, marginTop: 4, color: C.inkSoft,
  },
  nextTaxRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 11, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    shadowColor: 'rgba(20,30,25,1)', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  calIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.warningSoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  nextTaxLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: 10.5, color: C.inkSoft,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },
  nextTaxSub: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: C.warning, marginTop: 1 },
  nextTaxAmount: { fontFamily: 'Manrope_800ExtraBold', fontSize: 17, color: C.ink, letterSpacing: -0.3 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: C.ink },
  viewAll: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, color: C.primary },
  invoiceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  invoiceBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  invClient: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, color: C.ink },
  invMeta: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, color: C.inkFaint, marginTop: 2 },
  invAmount: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.ink, marginBottom: 4 },
});
