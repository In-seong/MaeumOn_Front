# MaeumOn Frontend

Vue 3 + TypeScript + Vite 기반의 Multi-Entry 프론트엔드 프로젝트입니다.

## 프로젝트 구조

```
MaeumOn_Front/
├── src/
│   ├── shared/              # 공통 모듈
│   │   ├── api/             # API 클라이언트 (Axios)
│   │   ├── components/      # 공통 컴포넌트
│   │   ├── composables/     # 공통 Composition API 훅
│   │   ├── services/        # 외부 서비스 연동
│   │   ├── styles/          # 공통 CSS (TailwindCSS)
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 유틸리티 함수
│   │
│   ├── user/                # 사용자 앱
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── router/
│   │   ├── stores/
│   │   ├── components/
│   │   ├── composables/
│   │   └── views/
│   │
│   ├── agent/               # 설계사 앱
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── router/
│   │   ├── stores/
│   │   ├── components/
│   │   ├── composables/
│   │   └── views/
│   │
│   └── admin/               # 관리자 웹
│       ├── App.vue
│       ├── main.ts
│       ├── router/
│       ├── stores/
│       ├── components/
│       ├── composables/
│       └── views/
│
├── user.html                # 사용자 앱 Entry
├── agent.html               # 설계사 앱 Entry
├── admin.html               # 관리자 웹 Entry
│
├── vite.config.ts           # 공통 Vite 설정
├── vite.user.config.ts      # 사용자 앱 빌드 설정
├── vite.agent.config.ts     # 설계사 앱 빌드 설정
├── vite.admin.config.ts     # 관리자 웹 빌드 설정
│
└── package.json
```

## 기술 스택

| 기술 | 버전 | 설명 |
|------|------|------|
| Vue | 3.x | 프론트엔드 프레임워크 |
| TypeScript | 5.x | 정적 타입 |
| Vite | 7.x | 빌드 도구 |
| TailwindCSS | 4.x | CSS 프레임워크 |
| Vue Router | 4.x | 라우팅 |
| Pinia | 2.x | 상태 관리 |
| Axios | 1.x | HTTP 클라이언트 |

## 요구 사항

- **Node.js**: 20.19+ 또는 22.12+ (필수)
- **npm**: 10.x+

## 로컬 개발 환경 설정

### 1. Node.js 버전 설정

```bash
# nvm 사용 시
nvm use 22

# 버전 확인
node -v  # v22.x.x
```

### 2. 의존성 설치

```bash
cd MaeumOn_Front
npm install
```

### 3. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=MaeumOn
```

### 4. 개발 서버 실행

```bash
# 사용자 앱 (포트: 5173)
npm run dev:user

# 설계사 앱 (포트: 5174)
npm run dev:agent

# 관리자 웹 (포트: 5175)
npm run dev:admin
```

접속 URL:
- 사용자 앱: http://localhost:5173
- 설계사 앱: http://localhost:5174
- 관리자 웹: http://localhost:5175

## 빌드

### 개별 빌드

```bash
# 사용자 앱 빌드
npm run build:user

# 설계사 앱 빌드
npm run build:agent

# 관리자 웹 빌드
npm run build:admin
```

### 전체 빌드

```bash
npm run build:all
```

### 빌드 결과

```
dist/
├── user/           # 사용자 앱 배포 파일
│   ├── index.html
│   └── assets/
├── agent/          # 설계사 앱 배포 파일
│   ├── index.html
│   └── assets/
└── admin/          # 관리자 웹 배포 파일
    ├── index.html
    └── assets/
```

### 빌드 미리보기

```bash
npm run preview:user
npm run preview:agent
npm run preview:admin
```

## 서버 배포

### Nginx 설정 예시

각 앱을 서브도메인 또는 서브 경로로 배포할 수 있습니다.

#### 옵션 1: 서브도메인 방식

```nginx
# 사용자 앱 - user.maeumon.com
server {
    listen 80;
    server_name user.maeumon.com;
    root /var/www/maeumon/user;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 설계사 앱 - agent.maeumon.com
server {
    listen 80;
    server_name agent.maeumon.com;
    root /var/www/maeumon/agent;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 관리자 웹 - admin.maeumon.com
server {
    listen 80;
    server_name admin.maeumon.com;
    root /var/www/maeumon/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 옵션 2: 서브 경로 방식

```nginx
server {
    listen 80;
    server_name maeumon.com;

    # 사용자 앱
    location /user {
        alias /var/www/maeumon/user;
        try_files $uri $uri/ /user/index.html;
    }

    # 설계사 앱
    location /agent {
        alias /var/www/maeumon/agent;
        try_files $uri $uri/ /agent/index.html;
    }

    # 관리자 웹
    location /admin {
        alias /var/www/maeumon/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 프록시
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 배포 스크립트 예시

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Building all apps..."
npm run build:all

echo "Deploying to server..."
rsync -avz --delete dist/user/ user@server:/var/www/maeumon/user/
rsync -avz --delete dist/agent/ user@server:/var/www/maeumon/agent/
rsync -avz --delete dist/admin/ user@server:/var/www/maeumon/admin/

echo "Deployment complete!"
```

### Docker 배포

```dockerfile
# Dockerfile
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:all

FROM nginx:alpine
COPY --from=build /app/dist/user /usr/share/nginx/html/user
COPY --from=build /app/dist/agent /usr/share/nginx/html/agent
COPY --from=build /app/dist/admin /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 공통 모듈 사용법

### API 클라이언트

```typescript
import api from '@shared/api'

// GET 요청
const response = await api.get('/users')

// POST 요청
const result = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
})
```

### 타입 사용

```typescript
import type { User, ApiResponse } from '@shared/types'

const user: User = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
}
```

### 스타일 적용

```typescript
// main.ts에서 공통 스타일 import
import '@shared/styles/main.css'
```

## 스크립트 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev:user` | 사용자 앱 개발 서버 (5173) |
| `npm run dev:agent` | 설계사 앱 개발 서버 (5174) |
| `npm run dev:admin` | 관리자 웹 개발 서버 (5175) |
| `npm run build:user` | 사용자 앱 빌드 |
| `npm run build:agent` | 설계사 앱 빌드 |
| `npm run build:admin` | 관리자 웹 빌드 |
| `npm run build:all` | 전체 앱 빌드 |
| `npm run preview:user` | 사용자 앱 빌드 미리보기 |
| `npm run preview:agent` | 설계사 앱 빌드 미리보기 |
| `npm run preview:admin` | 관리자 웹 빌드 미리보기 |
| `npm run type-check` | TypeScript 타입 체크 |

## 경로 별칭 (Path Alias)

| 별칭 | 경로 |
|------|------|
| `@shared/*` | `src/shared/*` |
| `@user/*` | `src/user/*` |
| `@agent/*` | `src/agent/*` |
| `@admin/*` | `src/admin/*` |

## 트러블슈팅

### Node.js 버전 오류

```
npm warn EBADENGINE Unsupported engine
```

해결: Node.js 22 이상 버전 사용
```bash
nvm install 22
nvm use 22
```

### 모듈을 찾을 수 없음

```
Cannot find module '@shared/...'
```

해결: TypeScript 경로 설정 확인
```bash
npm run type-check
```
