import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useDiaryStore } from '@project/shared/src/store/diaryStore';
import { useUIStore } from '@project/shared/src/store/uiStore';

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
  const accent = useUIStore((s) => s.theme_heavy);

  // markedDates: entries의 날짜별로 멀티 도트 + 기념일 강조
  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};

    for (const [date, items] of Object.entries(entries)) {
      if (!items || items.length === 0) continue;

      const hasAnniversary = items.some((i) => i.type === 'anniversary');
      const dots = items
        .slice(0, 4)
        .map((i, idx) => ({
          key: `${i.id}-${idx}`,
          color: i.color || accent || ACCENT_FALLBACK,
        }));

      result[date] = {
        marked: true,
        dots,
        ...(hasAnniversary && { customStyles: { container: { backgroundColor: '#fff7d6' } } }),
      };
    }

    // 오늘 날짜 강조 (다른 마킹과 합쳐짐)
    const today = format(new Date(), 'yyyy-MM-dd');
    result[today] = {
      ...(result[today] || {}),
      selected: true,
      selectedColor: accent || ACCENT_FALLBACK,
      selectedTextColor: 'white',
    };

    return result;
  }, [entries, accent]);

  const onDayPress = (day: DateData) => {
    router.push(`/day/${day.dateString}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-center">
        <Text className="text-lg font-semibold">다이어리</Text>
        {isLoading && <Text className="text-xs text-gray-400">불러오는 중…</Text>}
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        monthFormat={'yyyy MMMM'}
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

      <Pressable
        onPress={() => router.push(`/day/${format(new Date(), 'yyyy-MM-dd')}` as any)}
        style={{ backgroundColor: accent || ACCENT_FALLBACK }}
        className="absolute bottom-6 right-6 rounded-full w-14 h-14 items-center justify-center shadow-lg active:opacity-70"
      >
        <Text className="text-white text-3xl leading-9">+</Text>
      </Pressable>
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
    paddingBottom: 8,
  },
});
