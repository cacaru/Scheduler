import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDiaryStore, type EntryItem, type EntryType } from '@project/shared/src/store/diaryStore';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import EntryForm, { type EntryDraft, emptyDraft, draftFromEntry } from '../../components/EntryForm';

const SECTION_META: Record<EntryType, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  anniversary: { title: '기념일', icon: 'gift' },
  diary: { title: '일기', icon: 'create' },
  todo: { title: '할 일', icon: 'checkbox' },
};

type FormState =
  | { mode: 'add'; draft: EntryDraft }
  | { mode: 'edit'; draft: EntryDraft; id: string }
  | null;

export default function DayScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const safeDate = date || '';

  const allEntries = useDiaryStore((s) => s.entries);
  const addItem = useDiaryStore((s) => s.addItem);
  const updateItem = useDiaryStore((s) => s.updateItem);
  const deleteItem = useDiaryStore((s) => s.deleteItem);
  const toggleTodo = useDiaryStore((s) => s.toggleTodo);

  const [form, setForm] = useState<FormState>(null);
  const [saving, setSaving] = useState(false);

  const dayItems = allEntries[safeDate] || [];

  // 다른 날짜의 반복 기념일을 같은 MM-DD로 끌어옴
  const recurringAnnis = useMemo(() => {
    if (!safeDate || safeDate.length < 10) return [] as EntryItem[];
    const targetMMDD = safeDate.slice(5);
    const list: EntryItem[] = [];
    for (const [d, items] of Object.entries(allEntries)) {
      if (d === safeDate) continue;
      if (!d.endsWith(targetMMDD)) continue;
      for (const item of items) {
        if (item.type === 'anniversary' && item.is_recurring) list.push(item);
      }
    }
    return list;
  }, [allEntries, safeDate]);

  const anniversaries = useMemo(
    () => [...dayItems.filter((i) => i.type === 'anniversary'), ...recurringAnnis],
    [dayItems, recurringAnnis]
  );
  const diaries = useMemo(() => dayItems.filter((i) => i.type === 'diary'), [dayItems]);
  const todos = useMemo(() => dayItems.filter((i) => i.type === 'todo'), [dayItems]);

  const onAdd = (type: EntryType) => {
    setForm({ mode: 'add', draft: emptyDraft(type) });
  };

  const onEdit = (item: EntryItem) => {
    setForm({ mode: 'edit', draft: draftFromEntry(item), id: item.id });
  };

  const onSave = async (draft: EntryDraft) => {
    setSaving(true);
    try {
      if (!form) return;
      if (form.mode === 'add') {
        await addItem(
          safeDate,
          draft.type,
          draft.title,
          draft.content,
          draft.color,
          undefined,
          draft.is_recurring,
          draft.icon
        );
      } else {
        await updateItem(safeDate, form.id, {
          title: draft.title,
          content: draft.content,
          color: draft.color,
          icon: draft.icon,
          is_recurring: draft.is_recurring,
        });
      }
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (item: EntryItem) => {
    Alert.alert('삭제', `"${item.title}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteItem(safeDate, item.id),
      },
    ]);
  };

  const onToggleTodo = (item: EntryItem) => {
    toggleTodo(safeDate, item.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="px-2 py-1 active:opacity-50">
          <Ionicons name="chevron-back" size={24} color="#444" />
        </Pressable>
        <Text className="text-base font-semibold">{formatDateWithDay(safeDate)}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <Section
          type="anniversary"
          items={anniversaries}
          dayDate={safeDate}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleTodo={onToggleTodo}
        />
        <Section
          type="diary"
          items={diaries}
          dayDate={safeDate}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleTodo={onToggleTodo}
        />
        <Section
          type="todo"
          items={todos}
          dayDate={safeDate}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleTodo={onToggleTodo}
        />
      </ScrollView>

      <EntryForm
        visible={!!form}
        draft={form?.draft ?? null}
        saving={saving}
        isEdit={form?.mode === 'edit'}
        dateLabel={formatDateWithDay(safeDate)}
        onClose={() => setForm(null)}
        onSave={onSave}
      />
    </SafeAreaView>
  );
}

interface SectionProps {
  type: EntryType;
  items: EntryItem[];
  dayDate: string;
  onAdd: (type: EntryType) => void;
  onEdit: (item: EntryItem) => void;
  onDelete: (item: EntryItem) => void;
  onToggleTodo: (item: EntryItem) => void;
}

function Section({ type, items, dayDate, onAdd, onEdit, onDelete, onToggleTodo }: SectionProps) {
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
          <Text className="text-sm text-gray-400">아직 없음</Text>
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
            onPress={() => onEdit(item)}
            onLongPress={() => onDelete(item)}
            onToggle={type === 'todo' ? () => onToggleTodo(item) : undefined}
          />
        ))
      )}
    </View>
  );
}

interface ItemRowProps {
  item: EntryItem;
  isRecurringFromOtherDate: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggle?: () => void;
}

function ItemRow({ item, isRecurringFromOtherDate, onPress, onLongPress, onToggle }: ItemRowProps) {
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
    </Pressable>
  );
}
