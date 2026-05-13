/**
 * 다이어리/할일/기념일 항목을 타입별 섹션으로 보여주는 재사용 컴포넌트.
 * day/[date] 풀스크린, 캘린더 탭의 "오늘" 영역 등에서 공통으로 사용.
 */
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EntryItem, EntryType } from '@project/shared/src/store/diaryStore';
import { getAnniversaryIcon } from '../icons/anniversary';
import { Trash2 } from 'lucide-react-native';

const SECTION_META: Record<EntryType, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  anniversary: { title: '기념일', icon: 'gift' },
  diary: { title: '일기', icon: 'create' },
  todo: { title: '할 일', icon: 'checkbox' },
};

interface SectionProps {
  type: EntryType;
  items: EntryItem[];
  dayDate: string;
  onAdd: (type: EntryType) => void;
  onEdit: (item: EntryItem) => void;
  /** 미지정 시 길게 누름은 onEdit과 동일 동작 */
  onDelete?: (item: EntryItem) => void;
  /** 미지정 시 todo 체크박스 표시 안 함 */
  onToggleTodo?: (item: EntryItem) => void;
  /** 빈 상태 메시지 커스터마이즈 */
  emptyText?: string;
}

export function Section({
  type,
  items,
  dayDate,
  onAdd,
  onEdit,
  onDelete,
  onToggleTodo,
  emptyText,
}: SectionProps) {
  const meta = SECTION_META[type];
  return (
    <View className="px-4 pt-5">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons name={meta.icon} size={18} color="#666" />
          <Text className="ml-2 text-sm font-semibold text-gray-700">{meta.title}</Text>
          <Text className="ml-2 text-xs text-gray-400">({items.length})</Text>
        </View>
        <Pressable
          onPress={() => onAdd(type)}
          className="px-3 py-1 rounded-full bg-gray-100 active:opacity-50"
        >
          <Text className="text-sm text-gray-700">+ 추가</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View className="py-4">
          <Text className="text-sm text-gray-400">{emptyText ?? '아직 없음'}</Text>
        </View>
      ) : (
        items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            isRecurringFromOtherDate={
              item.type === 'anniversary' &&
              !!item.is_recurring &&
              !!item.start_date &&
              item.start_date !== dayDate
            }
            onDelete={onDelete ? () => onDelete(item) : undefined}
            onPress={() => onEdit(item)}
            onLongPress={() => (onDelete ?? onEdit)(item)}
            onToggle={type === 'todo' && onToggleTodo ? () => onToggleTodo(item) : undefined}
          />
        ))
      )}
    </View>
  );
}

interface ItemRowProps {
  item: EntryItem;
  isRecurringFromOtherDate: boolean;
  onDelete?: () => void;
  onPress: () => void;
  onLongPress: () => void;
  onToggle?: () => void;
}

export function ItemRow({ 
  item,
  isRecurringFromOtherDate, 
  onDelete,
  onPress, 
  onLongPress,
  onToggle }: ItemRowProps) {
  const AnniIcon = item.type === 'anniversary' ? getAnniversaryIcon(item.icon) : null;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center py-3 px-3 mb-2 rounded-lg active:opacity-70"
      style={{
        backgroundColor: (item.color || '#e2d5f9') + '40',
        borderLeftWidth: 4,
        borderLeftColor: item.color || '#ac9ec4',
      }}
    >
      {onToggle && (
        <Pressable onPress={onToggle} hitSlop={12} className="mr-3">
          <Ionicons
            name={item.completed ? 'checkbox' : 'square-outline'}
            size={22}
            color={item.completed ? '#888' : '#444'}
          />
        </Pressable>
      )}

      {AnniIcon &&
        <AnniIcon size={16} color={item.color || '#888'} style={{marginRight: 8}} />
      }

      <View className="flex-1">
        <Text
          className="text-base"
          style={{
            textDecorationLine: item.completed ? 'line-through' : 'none',
            color: item.completed ? '#888' : '#222',
          }}
        >
          {item.title}
          {isRecurringFromOtherDate && <Text className="text-xs text-gray-400">  (반복)</Text>}
        </Text>
        {item.content ? (
          <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
            {item.content}
          </Text>
        ) : null}
      </View>
      
      {/* 삭제 버튼 */}
      {onDelete && (
        <Pressable
          onPress={onDelete}
          hitSlop={10}
          className="ml-3 p-1 active:opacity-50"
        >
          <Trash2 size={16} color={'#ffb7b2'}/>
        </Pressable>
      )}
      
    </Pressable>
  );
}

/**
 * 특정 날짜 기준으로 다른 날짜의 매년 반복 기념일을 추출.
 * day 화면 / 캘린더 탭의 오늘 섹션이 공통으로 사용.
 */
export function getRecurringAnniversariesForDate(
  allEntries: Record<string, EntryItem[]>,
  date: string
): EntryItem[] {
  if (!date || date.length < 10) return [];
  const targetMMDD = date.slice(5);
  const list: EntryItem[] = [];
  for (const [d, items] of Object.entries(allEntries)) {
    if (d === date) continue;
    if (!d.endsWith(targetMMDD)) continue;
    for (const item of items) {
      if (item.type === 'anniversary' && item.is_recurring) list.push(item);
    }
  }
  return list;
}
