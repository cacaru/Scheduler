import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';

import type { EntryItem, EntryType } from '@project/shared/src/store/diaryStore';
import { PRESET_COLORS } from '@project/shared/src/constants/colors';
import { ICONS } from '@project/shared/src/constants/anniversary';
import { useUIStore } from '@project/shared/src/store/uiStore';
import LocationPickerModal from './LocationPickerModal';

export type EntryDraft = {
  type: EntryType;
  title: string;
  content: string;
  color: string;
  icon?: string;
  is_recurring?: boolean;
  location?: EntryItem['location'];
  start_date?: string; // "yyyy-MM-dd" — todo의 기간형일 때만
  end_date?: string;
};

export function emptyDraft(type: EntryType): EntryDraft {
  return {
    type,
    title: '',
    content: '',
    color: PRESET_COLORS[6],
    icon: type === 'anniversary' ? 'Gift' : undefined,
    is_recurring: type === 'anniversary' ? true : undefined,
  };
}

export function draftFromEntry(item: EntryItem): EntryDraft {
  return {
    type: item.type,
    title: item.title,
    content: item.content,
    color: item.color || PRESET_COLORS[6],
    icon: item.icon,
    is_recurring: item.is_recurring,
    location: item.location,
    start_date: item.start_date,
    end_date: item.end_date,
  };
}

interface Props {
  visible: boolean;
  draft: EntryDraft | null;
  saving: boolean;
  isEdit: boolean;
  /** 항목이 속한 날짜 (yyyy-MM-dd) — 기간 토글 기본값 등에 사용 */
  entryDate: string;
  dateLabel: string;
  onClose: () => void;
  onSave: (draft: EntryDraft) => Promise<void> | void;
}

const TYPE_LABEL: Record<EntryType, string> = {
  diary: '일기',
  todo: '할 일',
  anniversary: '기념일',
};

function safeParse(d: string | undefined, fallback: Date): Date {
  if (!d) return fallback;
  try {
    return parseISO(d);
  } catch {
    return fallback;
  }
}

export default function EntryForm({
  visible,
  draft,
  saving,
  isEdit,
  entryDate,
  dateLabel,
  onClose,
  onSave,
}: Props) {
  const accent = useUIStore((s) => s.theme_heavy);
  const [local, setLocal] = useState<EntryDraft | null>(draft);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (draft) setLocal(draft);
  }, [draft]);

  if (!visible || !local) return null;

  const update = (patch: Partial<EntryDraft>) => {
    setLocal((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const isRange = !!(local.start_date && local.end_date);
  const onToggleRange = (enabled: boolean) => {
    if (enabled) {
      update({ start_date: entryDate, end_date: entryDate });
    } else {
      update({ start_date: undefined, end_date: undefined });
    }
  };

  const onPickStart = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowStartPicker(Platform.OS === 'ios'); // iOS는 인라인이라 직접 닫을 때까지 유지
    if (!selected) return;
    const next = format(selected, 'yyyy-MM-dd');
    // end가 새 start보다 빠르면 end도 자동으로 맞춰줌
    const fixedEnd =
      local.end_date && local.end_date < next ? next : local.end_date ?? next;
    update({ start_date: next, end_date: fixedEnd });
  };

  const onPickEnd = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (!selected) return;
    const next = format(selected, 'yyyy-MM-dd');
    // end가 start보다 빠르면 start로 끌어올림
    const fixedEnd = local.start_date && next < local.start_date ? local.start_date : next;
    update({ end_date: fixedEnd });
  };

  const locationLabel = local.location
    ? local.location.name ||
      local.location.address ||
      `${local.location.lat.toFixed(4)}, ${local.location.lng.toFixed(4)}`
    : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Pressable onPress={onClose} className="px-2 py-1 active:opacity-50">
            <Text className="text-gray-600 text-base">취소</Text>
          </Pressable>
          <Text className="text-base font-semibold">
            {dateLabel} · {TYPE_LABEL[local.type]}
            {isEdit ? ' 수정' : ' 추가'}
          </Text>
          <Pressable
            onPress={() => onSave(local)}
            disabled={saving || !local.title.trim()}
            className="px-2 py-1 active:opacity-50"
          >
            {saving ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={{ color: local.title.trim() ? accent || '#ac9ec4' : '#9ca3af' }}
                className="font-semibold text-base"
              >
                저장
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <Text className="text-xs text-gray-500 mb-1">제목</Text>
          <TextInput
            value={local.title}
            onChangeText={(v) => update({ title: v })}
            placeholder="제목을 입력하세요"
            className="border border-gray-300 rounded-lg px-3 py-3 mb-4 text-base"
          />

          {local.type !== 'anniversary' && (
            <>
              <Text className="text-xs text-gray-500 mb-1">내용</Text>
              <TextInput
                value={local.content}
                onChangeText={(v) => update({ content: v })}
                placeholder="내용 (선택)"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-3 mb-4 text-base"
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
            </>
          )}

          <Text className="text-xs text-gray-500 mb-2">색상</Text>
          <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => update({ color: c })}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: c,
                  borderWidth: local.color === c ? 3 : 1,
                  borderColor: local.color === c ? '#333' : '#ddd',
                }}
              />
            ))}
          </View>

          {/* 위치 */}
          <Text className="text-xs text-gray-500 mb-2">위치</Text>
          {locationLabel ? (
            <View className="flex-row items-center mb-2 p-3 rounded-lg bg-gray-50">
              <Ionicons name="location" size={16} color="#666" />
              <Text className="flex-1 ml-2 text-sm text-gray-800" numberOfLines={1}>
                {locationLabel}
              </Text>
              <Pressable onPress={() => update({ location: undefined })} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </Pressable>
            </View>
          ) : null}
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center justify-center mb-4 p-3 rounded-lg bg-gray-100 active:opacity-70"
          >
            <Ionicons name="location-outline" size={16} color="#444" />
            <Text className="ml-2 text-sm text-gray-700">
              {local.location ? '위치 변경' : '위치 선택'}
            </Text>
          </Pressable>

          {/* todo 전용: 기간 */}
          {local.type === 'todo' && (
            <>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-gray-500">기간으로 설정</Text>
                <Switch value={isRange} onValueChange={onToggleRange} />
              </View>

              {isRange && (
                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-xs text-gray-500 w-14">시작</Text>
                    <Pressable
                      onPress={() => setShowStartPicker(true)}
                      className="flex-1 ml-2 p-3 rounded-lg bg-gray-50 active:opacity-70 flex-row items-center"
                    >
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text className="ml-2 text-sm text-gray-800">{local.start_date}</Text>
                    </Pressable>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 w-14">종료</Text>
                    <Pressable
                      onPress={() => setShowEndPicker(true)}
                      className="flex-1 ml-2 p-3 rounded-lg bg-gray-50 active:opacity-70 flex-row items-center"
                    >
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text className="ml-2 text-sm text-gray-800">{local.end_date}</Text>
                    </Pressable>
                  </View>

                  {showStartPicker && (
                    <DateTimePicker
                      value={safeParse(local.start_date, new Date())}
                      mode="date"
                      display="default"
                      onChange={onPickStart}
                    />
                  )}
                  {showEndPicker && (
                    <DateTimePicker
                      value={safeParse(local.end_date, new Date())}
                      mode="date"
                      display="default"
                      minimumDate={local.start_date ? safeParse(local.start_date, new Date()) : undefined}
                      onChange={onPickEnd}
                    />
                  )}
                </View>
              )}
            </>
          )}

          {local.type === 'anniversary' && (
            <>
              <Text className="text-xs text-gray-500 mb-2">아이콘</Text>
              <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                {ICONS.map(({ name }) => (
                  <Pressable
                    key={name}
                    onPress={() => update({ icon: name })}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      backgroundColor: local.icon === name ? local.color : '#f3f4f6',
                      borderWidth: 1,
                      borderColor: local.icon === name ? '#333' : '#e5e7eb',
                    }}
                  >
                    <Text className="text-xs">{name}</Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm">매년 반복</Text>
                <Switch
                  value={!!local.is_recurring}
                  onValueChange={(v) => update({ is_recurring: v })}
                />
              </View>
            </>
          )}
        </ScrollView>

        <LocationPickerModal
          visible={pickerOpen}
          initial={local.location}
          onSelect={(loc) => update({ location: loc })}
          onClose={() => setPickerOpen(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}
