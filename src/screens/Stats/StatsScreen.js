import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import colors from '../../theme/colors';
import { getStats, getHistory } from '../../services/StorageService';
import { ArrowLeft, Flame, Clock, CalendarCheck, History } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: 'Today'
};

const { width } = Dimensions.get('window');

const StatsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({ currentStreak: 0, totalSessions: 0, totalFocusTime: 0 });
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  LocaleConfig.defaultLocale = language;

  useEffect(() => {
    const loadData = async () => {
      const s = await getStats();
      if (s) setStats(s);
      
      const h = await getHistory();
      setHistory(h);
    };
    
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const markedDates = useMemo(() => {
    const marks = {};
    history.forEach(session => {
      const dayString = session.date.split('T')[0];
      marks[dayString] = { 
        selected: true, 
        selectedColor: dayString === selectedDate ? colors.textPrimary : colors.primary,
        selectedTextColor: dayString === selectedDate ? colors.background : '#ffffff'
      };
    });

    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = { 
        selected: true, 
        selectedColor: 'rgba(255,255,255,0.15)', 
        selectedTextColor: colors.textPrimary 
      };
    }

    return marks;
  }, [history, selectedDate]);

  const selectedDaySessions = useMemo(() => {
    return history.filter(s => s.date.startsWith(selectedDate));
  }, [history, selectedDate]);

  const formatHours = (seconds) => {
    const hours = seconds / 3600;
    return hours.toFixed(1) + t('hourShort');
  };

  const formatMinutes = (seconds) => {
    return Math.floor(seconds / 60) + t('minShort');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('yourJourney')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* BIG STREAK CARD */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.streakCardContainer}>
          <View style={styles.streakCardBackground}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.15" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0.02" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#grad)" rx={24} />
            </Svg>
          </View>
          
          <View style={styles.streakHeader}>
            <Flame size={28} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.cardTitle}>{t('currentStreak')}</Text>
          </View>

          <View style={styles.streakContent}>
            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text style={styles.streakText}>{t('days')}</Text>
          </View>
        </Animated.View>

        {/* STATS GRID */}
        <View style={styles.grid}>
          <Animated.View entering={FadeInDown.delay(150).duration(600).springify()} style={[styles.card, styles.gridItem]}>
            <CalendarCheck size={24} color={colors.textSecondary} style={styles.gridIcon} />
            <Text style={styles.gridTitle}>{t('sessions')}</Text>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={[styles.card, styles.gridItem]}>
            <Clock size={24} color={colors.textSecondary} style={styles.gridIcon} />
            <Text style={styles.gridTitle}>{t('focusTime')}</Text>
            <Text style={styles.statValue}>{formatHours(stats.totalFocusTime)}</Text>
          </Animated.View>
        </View>

        {/* CALENDAR VIEW */}
        <Animated.View entering={FadeInDown.delay(450).duration(600).springify()} style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.background,
              todayTextColor: colors.primary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: 'rgba(255,255,255,0.2)',
              dotColor: colors.primary,
              selectedDotColor: colors.background,
              arrowColor: colors.primary,
              monthTextColor: colors.textPrimary,
              indicatorColor: colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </Animated.View>

        {/* SELECTED DAY DETAILS */}
        <Animated.View entering={FadeInDown.delay(600).duration(600).springify()} style={styles.card}>
          <View style={styles.historyHeader}>
            <History size={20} color={colors.primary} />
            <Text style={styles.historyTitle}>{new Date(selectedDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' })}</Text>
          </View>

          {selectedDaySessions.length === 0 ? (
            <Text style={styles.emptyState}>{t('noSessions')}</Text>
          ) : (
            selectedDaySessions.map((session, index) => (
              <View key={session.id} style={[
                styles.activityRow,
                index === selectedDaySessions.length - 1 && { borderBottomWidth: 0 }
              ]}>
                <View style={styles.activityDot} />
                <Text style={styles.activityDate}>
                  {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <View style={styles.activityDurationBadge}>
                  <Text style={styles.activityDuration}>{formatMinutes(session.duration)}</Text>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backBtn: {
    padding: 5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  streakCardContainer: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)', // Subtle primary border
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: colors.surface,
  },
  streakCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 84, // Huge number
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 90,
  },
  streakText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    color: colors.textPrimary,
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gridItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  gridIcon: {
    marginBottom: 12,
  },
  gridTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyCard: {
    padding: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
    opacity: 0.8,
  },
  activityDate: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  activityDurationBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityDuration: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default StatsScreen;
