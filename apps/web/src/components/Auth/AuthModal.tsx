import React, { useState } from 'react';
import { supabase } from '@project/shared/src/utils/supabase';
import styles from './AuthModal.module.css';

const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('회원가입 확인 메일을 보냈습니다. 메일함을 확인해주세요!');
      }
    } catch (err: any) {
      setError(err.message || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || '구글 로그인에 실패했습니다.');
    }
  };

  return (
    <div className={styles.authOverlay}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>{isLogin ? '반가워요!' : '환영합니다!'}</h2>
          <p>{isLogin ? '로그인하여 일정을 관리해보세요.' : '새로운 계정을 만들고 시작해보세요.'}</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className={styles.authDivider}>
          <span>또는</span>
        </div>

        <button className={styles.googleLoginBtn} onClick={handleGoogleLogin}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className={styles.googleIcon}
          />
          Google로 계속하기
        </button>

        <div className={styles.authToggle}>
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
