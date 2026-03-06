# FOSSASIA Gallery - Project Guide

## Project Overview

FOSSASIA 발표를 위한 프로젝트. React Native(Expo)에서 대량 이미지 갤러리의 성능 최적화 사례를 다룸.

**Duration**: 10분

### Deliverables
1. **Slidev 슬라이드** (`/slides`) - 발표용 슬라이드 (sli.dev)
2. **Expo 데모 앱** (`/demo`) - 블로그 내용을 직접 구현하여 슬라이드 코드 근거로 활용
3. **발표자 스크립트** - 한국어/영어 병기, Slidev presenter notes에 포함

### Presentation Style
- 라이브 데모 없음 - 슬라이드에 코드 스니펫과 결과 데이터를 포함
- 데모 앱을 직접 구현하고 직접 측정한 수치를 슬라이드에 사용
- 블로그는 구현 방법론의 참고/영감 - 수치나 내용을 그대로 사용하지 않음

### Workflow
1. Expo 데모 앱 구현 (블로그 4단계 참고하여 직접 구현)
2. 실제 기기에서 성능 측정 (메모리, 로딩 시간 등)
3. 측정 데이터 + 코드 기반으로 Slidev 슬라이드 작성

## Project Structure

```
/slides          # Slidev presentation
  /slides.md     # Main slide deck with presenter notes (KR/EN)
  /components    # Custom Vue components for slides
  /public        # Images, GIFs, diagrams for slides

/demo            # Expo gallery demo app
  /app           # Expo Router pages
  /components    # Gallery components (before/after versions)
  /utils         # Performance monitoring utilities
```

## Presentation Topic

**Title**: "From 2GB to 200MB: Optimizing Large Image Lists in React Native"

**Abstract**: In-app photo picker에서 대량 이미지 렌더링 시 메모리 사용량이 2GB까지 치솟아 앱이 크래시되는 문제를 진단하고, 200MB 수준까지 최적화한 사례 발표.

**Reference**: https://blog.swmansion.com/react-native-image-list-recreating-apple-google-photos-in-react-native-part-1-7f73fb74fc63

### Implementation Steps (블로그 방법론 참고, 직접 구현)
1. **Step 1 - Loading**: expo-media-library 배칭 로드 + MMKV 캐싱
2. **Step 2 - Image Component**: `<Image>` vs `expo-image` 비교 구현
3. **Step 3 - Mipmaps**: ImageManipulator로 다운스케일 썸네일 생성
4. **Step 4 - List Component**: FlatList vs FlashList vs LegendList 비교 구현
5. **Techniques**: placeholder, blurhash, skeleton, cachePolicy 등

### Benchmarking
- 모든 수치는 직접 구현 후 실제 기기에서 측정
- 측정 항목: 메모리 사용량, 이미지 로딩 시간, 스크롤 FPS
- 데모 앱에 측정 유틸리티 포함

## Tech Stack

### Slides
- **Slidev** (sli.dev) - Markdown-based presentation tool
- Node.js / pnpm

### Demo App
- **Expo** (SDK 52+)
- **expo-image** - 고성능 이미지 컴포넌트
- **expo-media-library** - 기기 이미지 접근
- **expo-image-manipulator** - 썸네일/mipmap 생성
- **@shopify/flash-list** - 고성능 리스트 (뷰 재활용)
- **react-native-mmkv** - 고성능 캐싱
- TypeScript

## Conventions

### Slides
- Slidev presenter notes에 발표자 스크립트 작성
- 스크립트는 한국어 먼저, 영어 번역을 아래에 병기
- 슬라이드는 간결하게, 키워드와 비주얼 중심
- 코드 예제는 핵심 부분만 하이라이트

### Demo App
- Expo Router (file-based routing) 사용
- 단계별 스크린으로 before/after 비교 가능하게 구성
- 성능 메트릭 오버레이 (메모리 사용량 등) 표시
- TypeScript strict mode

### General
- 커밋 메시지: 영어, conventional commits (feat:, fix:, docs:)
- 패키지 매니저: pnpm (slides), npx expo (demo)

## Slide Flow (10min, ~12-15 slides)

1. Title + Self-intro (30s)
2. Motivation - 왜 in-app photo picker가 필요한가 (30s)
3. The Problem - naive 구현 시 메모리 2GB, 크래시 (1min)
4. How Apple/Google Photos Do It - 인덱싱, 저해상도 먼저 (30s)
5. Step 1: Batching & Caching - expo-media-library + MMKV (1min)
6. Step 2: Image Component - Image vs expo-image 벤치마크 (1.5min)
7. Step 3: Mipmaps - ImageManipulator 썸네일 생성 (1.5min)
8. Step 4: List Component - FlatList vs FlashList vs LegendList (1.5min)
9. Results - 메모리 비교, 스크롤 성능 (1min)
10. Lessons Learned & Takeaways (30s)
11. Q&A (30s)

## SWMansion Blog Reference (영감/방법론 참고용, 수치 미사용)
- URL: https://blog.swmansion.com/react-native-image-list-recreating-apple-google-photos-in-react-native-part-1-7f73fb74fc63
- GitHub Repo: referenced in blog (SWM Photo app)
- Related Expo PRs: #37795, #37979, #37987 (expo-image iOS improvements)
- 블로그의 벤치마크 데이터는 memory/benchmark-data.md에 참고용으로 보관
