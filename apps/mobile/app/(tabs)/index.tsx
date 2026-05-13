import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useDiaryStore } from '@project/shared/src/store/diaryStore';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { getRecurringAnniversariesForDate } from '../../components/EntrySections';
import TodayPreview from '../../components/TodayPreview';
import { fullSync } from '../../sync/sync';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const ACCENT_FALLBACK = '#ac9ec4';

export default function CalendarScreen() {
  const router = useRouter();
  const entries = useDiaryStore((s) => s.entries);
  const isLoading = useDiaryStore((s) => s.isLoading);
  const toggleTodo = useDiaryStore((s) => s.toggleTodo);
  const fetchEntries = useDiaryStore((s) => s.fetchEntries);
  const accent = useUIStore((s) => s.theme_heavy);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fullSync();
      await fetchEntries();
    } finally {
      setRefreshing(false);
    }
  };

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  // 오늘 항목 분류 (반복 기념일 자동 합침)
  const todayItems = entries[today] || [];
  const recurringAnnis = useMemo(
    () => getRecurringAnniversariesForDate(entries, today),
    [entries, today]
  );
  const todayAnniversaries = useMemo(
    () => [...todayItems.filter((i) => i.type === 'anniversary'), ...recurringAnnis],
    [todayItems, recurringAnnis]
  );
  const todayDiaries = useMemo(() => todayItems.filter((i) => i.type === 'diary'), [todayItems]);
  const todayTodos = useMemo(() => todayItems.filter((i) => i.type === 'todo'), [todayItems]);

  // 통합 리스트 (표시 순서: 기념일 → 일기 → 할일)
  const todayCombined = useMemo(
    () => [...todayAnniversaries, ...todayDiaries, ...todayTodos],
    [todayAnniversaries, todayDiaries, todayTodos]
  );
  const todayCounts = useMemo(
    () => ({
      anniversary: todayAnniversaries.length,
      diary: todayDiaries.length,
      todo: todayTodos.length,
    }),
    [todayAnniversaries, todayDiaries, todayTodos]
  );

  // 캘린더 마커
  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};
    for (const [date, items] of Object.entries(entries)) {
      if (!items || items.length === 0) continue;
      const hasAnniversary = items.some((i) => i.type === 'anniversary');
      const dots = items.slice(0, 4).map((i, idx) => ({
        key: `${i.id}-${idx}`,
        color: i.color || accent || ACCENT_FALLBACK,
      }));
      result[date] = {
        marked: true,
        dots,
        ...(hasAnniversary && { customStyles: { container: { backgroundColor: '#fff7d6' } } }),
      };
    }
    result[today] = {
      ...(result[today] || {}),
      selected: true,
      selectedColor: accent || ACCENT_FALLBACK,
      selectedTextColor: 'white',
    };
    return result;
  }, [entries, accent, today]);

  const onDayPress = (day: DateData) => {
    router.push(`/day/${day.dateString}` as never);
  };

  // 오늘 위젯 콜백
  const goToToday = () => router.push(`/day/${today}` as never);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold">다이어리</Text>
        {isLoading && <Text className="text-xs text-gray-400">불러오는 중…</Text>}
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={onDayPress}
        firstDay={0}
        enableSwipeMonths
        theme={{
          arrowColor: accent || ACCENT_FALLBACK,
          monthTextColor: '#222',
          textMonthFontWeight: '600',
          todayTextColor: accent || ACCENT_FALLBACK,
          textDayFontSize: 14,
          textMonthFontSize: 16,
        }}
        style={styles.calendar}
      />

      <View className="flex-row items-center justify-center gap-4 px-4 pt-1 pb-2 border-b border-gray-100">
        <LegendDot color="#88b" label="일기" />
        <LegendDot color="#8b8" label="할 일" />
        <LegendDot color="#fd0" label="기념일(배경)" />
      </View>

      {/* 하단: 오늘 위젯 카드 (캘린더는 고정, 이 영역만 스크롤 + 당겨서 새로고침) */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent || ACCENT_FALLBACK}
            colors={[accent || ACCENT_FALLBACK]}
          />
        }
      >
        <TodayPreview
          date={today}
          items={todayCombined}
          counts={todayCounts}
          onOpenDay={goToToday}
          onItemTap={goToToday}
          onToggleTodo={(item) => toggleTodo(today, item.id)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 4 }} />
      <Text className="text-xs text-gray-600">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    paddingBottom: 4,
  },
});
