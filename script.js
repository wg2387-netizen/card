/**
 * 박지현 바이브코딩 웹 명함 인터랙션 스크립트 (script.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const card = document.getElementById('businessCard');
  const themeToggle = document.getElementById('themeToggle');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const avatarWrapper = document.getElementById('avatarWrapper');
  const avatarSpeech = document.getElementById('avatarSpeech');
  const contactItems = document.querySelectorAll('.contact-item');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const shareBtn = document.getElementById('shareBtn');

  // 토스트 타이머
  let toastTimeout = null;

  /* ================= 1. 테마 토글 & 초기화 ================= */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-mode');
      updateThemeIcon(true);
    } else {
      document.body.classList.remove('dark-mode');
      updateThemeIcon(false);
    }
  };

  const updateThemeIcon = (isDark) => {
    const icon = themeToggle.querySelector('i');
    if (isDark) {
      icon.className = 'fa-solid fa-sun';
      themeToggle.setAttribute('title', '라이트 모드로 전환');
    } else {
      icon.className = 'fa-solid fa-moon';
      themeToggle.setAttribute('title', '다크 모드로 전환');
    }
  };

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
    showToast(isDark ? '🌙 다크 모드로 변경되었습니다.' : '☀️ 라이트 모드로 변경되었습니다.');
  });

  /* ================= 2. 토스트 메시지 함수 ================= */
  const showToast = (message) => {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  };

  /* ================= 3. 3D 카드 틸트(기울기) 효과 ================= */
  if (window.matchMedia('(pointer: fine)').matches) {
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // 상하 회전각
      const rotateY = ((x - centerX) / centerX) * 9;  // 좌우 회전각

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  }

  /* ================= 4. 캐릭터 아바타 말풍선 대사 & 윙크 인터랙션 ================= */
  const greetings = [
    '반가워요! 좋은 하루 보내세요 ✨',
    '바이브코딩 풀스택 개발자 박지현입니다 💖',
    '클릭해 주셔서 감사해요! 상큼한 에너지 팡팡 ☀️',
    '새롭고 멋진 프로젝트 언제든 환영해요 🚀',
    '따뜻한 커피챗 편하게 연락주세요 ☕',
    '긍정적인 바이브로 즐겁게 코딩 중! 💻'
  ];
  let greetingIndex = 0;
  let speechTimeout = null;

  avatarWrapper.addEventListener('click', () => {
    // 윙크 애니메이션 효과
    const rightEyeGroup = document.querySelector('.eye-right-group');
    if (rightEyeGroup) {
      rightEyeGroup.classList.add('wink');
      setTimeout(() => {
        rightEyeGroup.classList.remove('wink');
      }, 350);
    }

    greetingIndex = (greetingIndex + 1) % greetings.length;
    avatarSpeech.textContent = greetings[greetingIndex];
    avatarSpeech.classList.add('active');

    if (speechTimeout) clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => {
      avatarSpeech.classList.remove('active');
    }, 2800);
  });

  /* ================= 5. 클립보드 복사 기능 ================= */
  const copyToClipboard = async (text, label) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure / legacy contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast(`${label}이(가) 복사되었습니다! 📋`);
    } catch (err) {
      showToast('복사에 실패했습니다.');
      console.error('Copy failed:', err);
    }
  };

  contactItems.forEach(item => {
    const copyValue = item.getAttribute('data-copy');
    const label = item.querySelector('.label')?.textContent || '정보';

    // 행 전체 클릭 시 (내부 링크나 버튼 클릭이 아닌 경우 복사)
    item.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // 링크 클릭은 기본 링크 이동 유지
      copyToClipboard(copyValue, label);
    });

    const copyBtn = item.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(copyValue, label);
      });
    }
  });

  /* ================= 6. vCard (.vcf) 연락처 파일 다운로드 ================= */
  saveContactBtn.addEventListener('click', () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:박;지현;;;',
      'FN:박지현',
      'TITLE:바이브코딩 풀스택 개발자',
      'ORG:weven',
      'TEL;TYPE=CELL:010-1234-5678',
      'EMAIL;TYPE=WORK:pjh@weven.kr',
      'URL:https://weven.kr',
      'NOTE:바이브코딩 풀스택 개발자 박지현의 웹 명함',
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '박지현_바이브코딩.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('연락처 파일(vCard)이 다운로드되었습니다! 📱');
  });

  /* ================= 7. 명함 공유 기능 ================= */
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: '박지현 | 바이브코딩 풀스택 개발자 웹 명함',
      text: '바이브코딩 풀스택 개발자 박지현의 웹 명함입니다. (010-1234-5678, pjh@weven.kr)',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('명함이 공유되었습니다! ✨');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(window.location.href, '명함 주소');
        }
      }
    } else {
      copyToClipboard(window.location.href, '명함 주소');
    }
  });

  // 초기 테마 설정 실행
  initTheme();
});
