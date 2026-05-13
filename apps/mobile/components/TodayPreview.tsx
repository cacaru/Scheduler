/**
 * 캘린더 탭의 "오늘" 위젯.
 * - 테마 색으로 통일된 카드 안에 통합 리스트
 * - 헤더에 타입별 카운트 칩 + 화살표 (탭하면 day 화면으로)
 * - 한 줄짜리 compact 행: 색 바 + 타입 아이콘(or 체크박스) + 제목 (1줄)
 *
 * day 화면의 풍부한 편집 UI와 시각적으로 명확히 구분되어
 * "훑어보기 + 빠른 진입" 역할에 충실하도록 의도.
 */
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EntryItem, EntryType } from '@project/shared/src/store/diaryStore';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';

const TYPE_ICON: Record<EntryType, keyof typeof Ionicons.glyphMap> = {
  anniversary: 'gift',
  diary: 'create',
  todo: 'checkbox',
};

interface Counts {
  anniversary: number;
  diary: number;
  todo: number;
}

interface Props {
  date: string;
  items: EntryItem[];
  counts: Counts;
  onOpenDay: () => void;
  onItemTap: (item: EntryItem) => void;
  onToggleTodo: (item: EntryItem) => void;
}

export default function TodayPreview({
  date,
  items,
  counts,
  onOpenDay,
  onItemTap,
  onToggleTodo,
}: Props) {
  const themeLight = useUIStore((s) => s.theme_light);
  const themeHeavy = useUIStore((s) => s.theme_heavy);
  const cardBg = themeLight || '#e2d5f925';
  const accent = themeHeavy || '#ac9ec4';
  const border = accent + '40'; // 헤비 색에 25% alpha

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 12,
      }}
    >
      {/* 헤더: 날짜 + 카운트 칩 + 화살표 */}
      <Pressable
        onPress={onOpenDay}
        className="flex-row items-center justify-between mb-3 active:opacity-70"
      >
        <View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: accent }}>오늘</Text>
          <Text className="text-xs text-gray-600 mt-0.5">{formatDateWithDay(date)}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          {counts.anniversary > 0 && (
            <Chip icon={TYPE_ICON.anniversary} count={counts.anniversary} color={accent} />
          )}
          {counts.diary > 0 && (
            <Chip icon={TYPE_ICON.diary} count={counts.diary} color={accent} />
          )}
          {counts.todo > 0 && (
            <Chip icon={TYPE_ICON.todo} count={counts.todo} color={accent} />
          )}
          <Ionicons name="chevron-forward" size={16} color={accent} style={{ marginLeft: 4 }} />
        </View>
      </Pressable>

      {/* 항목 리스트 */}
      {items.length === 0 ? (
        <Pressable
          onPress={onOpenDay}
          className="py-4 items-center active:opacity-70"
        >
          <Text className="text-xs text-gray-500">오늘 등록된 항목이 없어요</Text>
          <Text
            className="text-xs mt-1"
            style={{ color: accent, fontWeight: '600' }}
          >
            + 추가하기
          </Text>
        </Pressable>
      ) : (
        items.map((item) => (
          <CompactRow
            key={item.id}
            item={item}
            onPress={() => onItemTap(item)}
            onToggle={item.type === 'todo' ? () => onToggleTodo(item) : undefined}
          />
        ))
      )}
    </View>
  );
}

function Chip({
  icon,
  count,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color: string;
}) {
  return (
    <View
      className="flex-row items-center"
      style={{
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.7)',
      }}
    >
      <Ionicons name={icon} size={11} color={color} />
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{count}</Text>
    </View>
  );
}

function CompactRow({
  item,
  onPress,
  onToggle,
}: {
  item: EntryItem;
  onPress: () => void;
  onToggle?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center mb-1.5 active:opacity-70"
      style={{
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.6)',
      }}
    >
      {/* 좌측 색 바 (얇은 세로) */}
      <View
        style={{
          width: 3,
          height: 18,
          borderRadius: 1.5,
          backgroundColor: item.color || '#ac9ec4',
          marginRight: 8,
        }}
      />

      {/* todo는 체크박스, 그 외엔 타입 아이콘 */}
      {onToggle ? (
        <Pressable onPress={onToggle} hitSlop={10} style={{ marginRight: 6 }}>
          <Ionicons
            name={item.completed ? 'checkbox' : 'square-outline'}
            size={16}
            color={item.completed ? '#888' : '#555'}
          />
        </Pressable>
      ) : (
        <Ionicons
          name={TYPE_ICON[item.type]}
          size={14}
          color="#888"
          style={{ marginRight: 6 }}
        />
      )}

      {/* 제목 1줄 truncate */}
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: item.completed ? '#888' : '#222',
          textDecorationLine: item.completed ? 'line-through' : 'none',
        }}
        numberOfLines={1}
      >
        {item.title}
      </Text>
    </Pressable>
  );
}
