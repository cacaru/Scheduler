import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EntryItem, EntryType } from '@project/shared/src/store/diaryStore';
import { PRESET_COLORS } from '@project/shared/src/constants/colors';
import { ICONS } from '@project/shared/src/constants/anniversary';

export type EntryDraft = {
  type: EntryType;
  title: string;
  content: string;
  color: string;
  icon?: string;
  is_recurring?: boolean;
};

export function emptyDraft(type: EntryType): EntryDraft {
  return {
    type,
    title: '',
    content: '',
    color: PRESET_COLORS[6], // soft lavender
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
  };
}

interface Props {
  visible: boolean;
  draft: EntryDraft | null;
  saving: boolean;
  isEdit: boolean;
  dateLabel: string;
  onClose: () => void;
  onSave: (draft: EntryDraft) => Promise<void> | void;
}

const TYPE_LABEL: Record<EntryType, string> = {
  diary: '일기',
  todo: '할 일',
  anniversary: '기념일',
};

export default function EntryForm({
  visible,
  draft,
  saving,
  isEdit,
  dateLabel,
  onClose,
  onSave,
}: Props) {
  const [local, setLocal] = useState<EntryDraft | null>(draft);

  // 부모가 새 draft를 내려보내면 (다른 항목 편집 / 새로 추가) 로컬 상태를 동기화
  useEffect(() => {
    if (draft) setLocal(draft);
  }, [draft]);

  if (!visible || !local) return null;

  const update = (patch: Partial<EntryDraft>) => {
    setLocal((prev) => (prev ? { ...prev, ...patch } : prev));
  };

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
                className={
                  local.title.trim() ? 'text-accent-heavy font-semibold text-base' : 'text-gray-400 text-base'
                }
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
      </SafeAreaView>
    </Modal>
  );
}
