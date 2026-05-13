import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDiaryStore, type EntryItem, type EntryType } from '@project/shared/src/store/diaryStore';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';
import EntryForm, { type EntryDraft, emptyDraft, draftFromEntry } from '../../components/EntryForm';
import { Section, getRecurringAnniversariesForDate } from '../../components/EntrySections';
import { fullSync } from '../../sync/sync';

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
  const fetchEntries = useDiaryStore((s) => s.fetchEntries);
  const accent = useUIStore((s) => s.theme_heavy);

  const [form, setForm] = useState<FormState>(null);
  const [saving, setSaving] = useState(false);
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

  const dayItems = allEntries[safeDate] || [];
  const recurringAnnis = useMemo(
    () => getRecurringAnniversariesForDate(allEntries, safeDate),
    [allEntries, safeDate]
  );

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
          draft.location,
          draft.is_recurring,
          draft.icon,
          draft.start_date,
          draft.end_date
        );
      } else {
        await updateItem(safeDate, form.id, {
          title: draft.title,
          content: draft.content,
          color: draft.color,
          icon: draft.icon,
          is_recurring: draft.is_recurring,
          location: draft.location,
          start_date: draft.start_date,
          end_date: draft.end_date,
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="px-2 py-1 active:opacity-50">
          <Ionicons name="chevron-back" size={24} color="#444" />
        </Pressable>
        <Text className="text-base font-semibold">{formatDateWithDay(safeDate)}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accent || '#ac9ec4'}
            colors={[accent || '#ac9ec4']}
          />
        }
      >
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
        entryDate={safeDate}
        dateLabel={formatDateWithDay(safeDate)}
        onClose={() => setForm(null)}
        onSave={onSave}
      />
    </SafeAreaView>
  );
}
