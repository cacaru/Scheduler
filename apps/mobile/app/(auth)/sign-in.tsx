import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@project/shared/src/utils/supabase';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold mb-8">나의 작은 스케쥴러</Text>

        <TextInput
          className="w-full border border-gray-300 rounded-lg px-3 py-3 mb-3 text-base"
          placeholder="이메일"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-3 py-3 mb-3 text-base"
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text className="text-red-500 mb-3">{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="w-full bg-accent-heavy rounded-lg py-3 items-center mb-4 active:opacity-70"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {mode === 'sign-in' ? '로그인' : '회원가입'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))}>
          <Text className="text-gray-600 text-sm">
            {mode === 'sign-in' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
