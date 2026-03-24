# Google Drive Todo App (React)

이 프로젝트는 React와 Google Drive API를 사용하여 할 일 목록을 관리하고 클라우드에 동기화하는 애플리케이션입니다.

## 🚀 시작하기

### 1. 의존성 설치
터미널에서 다음 명령어를 실행하여 필요한 패키지를 설치하세요.
```bash
npm install
```

### 2. Google Cloud 설정
`src/hooks/useGoogleDrive.js` 파일을 열고 다음 상수를 본인의 키 값으로 교체하세요.
- `CLIENT_ID`: Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID
- `API_KEY`: Google Cloud Console에서 발급받은 API 키

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` (또는 터미널에 표시된 주소)로 접속하세요.

## 📂 주요 기능
- **할 일 관리**: 추가, 수정, 삭제, 완료 체크
- **카테고리**: 업무, 개인, 공부 태그 분류
- **진행률**: 완료율에 따라 색상이 변하는(적→녹) 그라데이션 바
- **동기화**: 
  - 기본적으로 `localStorage`에 자동 저장됩니다.
  - "Google Drive 연동" 버튼을 눌러 로그인하면, 내 Google Drive의 `todo-data.json` 파일과 동기화됩니다.

## ⚠️ 주의사항
- Google Cloud Console의 "승인된 자바스크립트 원본"에 `http://localhost:3000`이 등록되어 있어야 로그인이 정상 작동합니다.
