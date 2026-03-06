# Speaker Script

## Slide 1: Title + Self-intro

Hello, I'm Miryang Jung. I'm a Senior Frontend Engineer at Grandeclip.
I'm so happy to be here in Thailand, the land of Muay Thai. I bought so much boxing gear at Twins - I've been boxing for about a year now.
Today I'll share how we reduced memory usage from 2GB to 200MB when rendering large image lists in React Native.

안녕하세요, 정미량입니다. Grandeclip에서 시니어 프론트엔드 엔지니어로 일하고 있습니다.
무에타이의 나라 태국에 와서 정말 기쁩니다. Twins에서 복싱 용품을 잔뜩 샀어요. 복싱 1년차입니다.
오늘은 React Native에서 대량의 이미지를 렌더링할 때 메모리 사용량을 2GB에서 200MB로 줄인 경험을 공유하겠습니다.

---

## Slide 2: Why Build an In-App Photo Picker?

Why build an in-app photo picker?
The system picker has limited customization.
We needed album-specific image lists, masonry layouts, variable grid columns, and other custom UI.
We wanted multi-select with full control over UX and performance.

왜 인앱 포토 피커를 만들어야 했을까요?
시스템 피커는 커스터마이징이 제한적입니다.
앨범별 이미지 리스트, 메이슨리 레이아웃, 그리드 갯수 변환 등 커스텀 UI가 필요했습니다.
멀티셀렉트와 UX를 완전히 제어하기 위해 직접 만들기로 했습니다.

---

## Slide 3: The Problem

Let's look at the problem. The simplest implementation - put Image components in a FlatList and render 1,809 photos.
RAM spikes to ~5GB and the app crashes.
Every cell loads full-resolution images with no recycling and no caching.

문제를 보겠습니다. 가장 단순한 구현 - FlatList에 Image 컴포넌트를 넣고 1,809장의 사진을 렌더링하면 어떻게 될까요?
RAM이 5GB까지 치솟고 앱이 크래시됩니다.
모든 셀이 풀 해상도 이미지를 로드하고, 리사이클링도 캐싱도 없기 때문입니다.

---

## Slide 4: How Other Gallery Apps Solve This

How do other gallery apps handle thousands of photos efficiently?
First, index metadata only and load images on demand.
Second, pre-generate low-res thumbnails at exact display size.
Third, recycle cells as you scroll.
Fourth, progressive loading from placeholder to thumbnail to full resolution.

다른 갤러리 앱들은 수천 장의 사진을 어떻게 효율적으로 처리할까요?
첫째, 메타데이터만 먼저 인덱싱하고 이미지는 필요할 때 로드합니다.
둘째, 디스플레이 사이즈에 맞는 저해상도 썸네일을 미리 생성합니다.
셋째, 스크롤할 때 셀을 재활용합니다.
넷째, placeholder에서 썸네일, 풀 해상도로 점진적 로딩합니다.

---

## Slide 5: Batch Loading & Caching

First, loading. Instead of loading all 1,809 photos at once, we load 50 at a time.
ph:// URI is just an asset reference - an identifier in the iOS Photos library, not actual pixel data.
We use endCursor pagination for infinite scroll.
Now we have lightweight asset references. But how do we actually render them on screen?

첫 번째, 로딩입니다. 한번에 1,809장을 다 로드하지 않고 50장씩 배치로 로드합니다.
ph:// URI는 iOS Photos 라이브러리의 에셋 식별자일 뿐, 실제 픽셀 데이터가 아닙니다.
endCursor를 이용한 페이지네이션으로 무한 스크롤을 구현합니다.
이제 가벼운 에셋 참조는 확보했습니다. 그런데 이걸 실제로 화면에 어떻게 렌더링할까요?

---

## Slide 6: Rendering - RN Image + FlashList

Now, rendering. The first thing I tried was RN Image.
RN Image can't load ph:// URIs directly - it needs getAssetInfoAsync to resolve to file:// first.
This requires an async call per cell, averaging 3,796ms load time. RAM is 311MB.
Almost 4 seconds of blank cells is unacceptable. There must be a better image component.

다음은 렌더링입니다. 처음 시도한 건 RN Image입니다.
RN Image는 ph:// URI를 직접 로드할 수 없어서 getAssetInfoAsync로 file:// URI를 먼저 구해야 합니다.
셀마다 비동기 호출이 필요하고, 평균 로드 시간이 3,796ms입니다. RAM은 311MB입니다.
빈 셀을 4초나 보여주는 건 용납할 수 없습니다. 더 나은 이미지 컴포넌트가 필요합니다.

---

## Slide 7: Rendering - useImage Trap

Still on rendering - the useImage trap.
We initially used useImage because an Expo issue recommended this approach.
useImage loads full-resolution images and keeps them in memory. But FlashList reuses cells instead of destroying them, so old images never get cleaned up - they just pile up. It's a memory leak.
RAM spikes to 4,848MB and the app crashes.

아직 렌더링 이야기입니다 - useImage 훅의 함정입니다.
처음에 Expo 이슈에서 useImage를 사용하라고 권장해서 이 방식으로 구현했습니다.
useImage는 풀사이즈 이미지를 로드하고 메모리에 유지합니다. 하지만 FlashList는 셀을 파괴하지 않고 재사용하므로, 이전 이미지가 정리되지 않고 쌓입니다. 메모리 누수입니다.
RAM이 4,848MB까지 치솟고 앱이 크래시됩니다.
훅이 아니라, 네이티브에서 ph:// URI를 직접 처리하는 컴포넌트가 필요합니다.

---

## Slide 8: Rendering - expo-image + FlashList

expo-image resolves ph:// URIs natively - no async JavaScript calls needed.
It supports view recycling, and recyclingKey tells it to clear the old image and load the new one when a cell is reused.
Average load time is 85ms, RAM stays at 182MB. That's 45x faster than RN Image.
But we're still decoding full 12-megapixel photos for tiny thumbnails. Can we reduce what we decode?

expo-image는 ph:// URI를 네이티브에서 직접 처리합니다 - 비동기 JavaScript 호출이 필요 없습니다.
뷰 리사이클링을 지원하고, recyclingKey로 셀이 재사용될 때 이전 이미지를 클리어하고 새 이미지를 올바르게 로드합니다.
평균 로드 시간 85ms, RAM 182MB로 안정적입니다. RN Image 대비 45배 빠릅니다.
하지만 여전히 작은 썸네일 셀을 위해 12메가픽셀 풀사이즈를 디코딩하고 있습니다. 디코딩하는 양 자체를 줄일 수 있을까요?

---

## Slide 9: Decoding - Mipmaps

Now, decoding. Original images are 4032x3024, 12 megapixels. But grid cells are only 98x98 points.
We use PixelRatio to generate 294x294 pixel thumbnails for retina displays.
That's about 170x fewer pixels to decode per cell.
Generated mipmaps are saved to disk and indexed with MMKV for instant access on next launch.

다음은 디코딩입니다. 원본 이미지는 4032x3024, 12메가픽셀입니다. 하지만 그리드 셀은 98x98 포인트에 불과합니다.
PixelRatio를 사용해 레티나 디스플레이에 맞는 294x294 픽셀 썸네일을 생성합니다.
셀당 디코딩할 픽셀이 약 170분의 1로 줄어듭니다.
생성된 밉맵은 디스크에 저장하고 MMKV로 인덱싱해서 다음 실행 시 즉시 사용합니다.

---

## Slide 10: Decoding - Mipmap Implementation

Here's how we implement mipmaps.
First, size calculation. We divide screen width by 4 for our 4-column grid, then use PixelRatio to convert to physical pixels. On a 3x retina iPhone, a 98-point cell becomes 294 pixels - exactly what the screen displays.
The cache key includes the mipmap width, so if the grid layout changes, new mipmaps are generated at the correct size automatically.
Then we use expo-image-manipulator to resize and save as a compressed JPEG - about 20-30KB instead of several megabytes. Each thumbnail is saved to disk and indexed with MMKV.
The first launch takes a few seconds to generate, but every subsequent launch loads instantly from cache.

밉맵 구현 과정입니다.
먼저 사이즈 계산. 4열 그리드이므로 화면 너비를 4로 나누고, PixelRatio로 물리적 픽셀로 변환합니다. 3x 레티나 아이폰에서 98포인트는 294픽셀 - 화면이 실제로 표시하는 크기입니다.
캐시 키에 밉맵 너비가 포함되어 있어서, 그리드 레이아웃이 바뀌면 자동으로 새 사이즈로 생성됩니다.
expo-image-manipulator로 리사이즈하고 JPEG로 저장합니다. 수 메가바이트가 20-30KB로 줄어듭니다. 각 썸네일은 디스크에 저장하고 MMKV로 인덱싱합니다.
첫 실행만 생성 시간이 걸리고, 이후엔 캐시에서 즉시 로드됩니다.

---

## Slide 11: Decoding - Mipmaps Result

Mipmap results.
RAM 174MB, average load time 57ms.
That's 4% less RAM and 33% faster load time compared to expo-image alone.
And mipmaps are disk-cached, so they load instantly on relaunch.

밉맵 적용 결과입니다.
RAM 174MB, 평균 로드 시간 57ms입니다.
expo-image 단독 대비 RAM이 4% 줄고, 로드 시간은 33% 빨라졌습니다.
그리고 밉맵은 디스크에 캐시되므로 앱을 다시 실행해도 즉시 로드됩니다.
이 모든 것을 하나로 묶어주는 마지막 퍼즐은 리스트 컴포넌트입니다.

---

## Slide 12: Scrolling - FlashList

Finally, scrolling. FlatList mounts every cell from scratch on scroll. No view recycling means frame drops and blank cells during fast scrolling.
FlashList recycles cells like iOS UICollectionView - smooth scrolling with no blank areas.
recyclingKey tells expo-image that a cell now represents a different photo, so it clears the old image and loads the new one correctly.

마지막으로 스크롤링입니다. FlatList는 스크롤할 때마다 모든 셀을 새로 마운트합니다. 뷰 리사이클링이 없어서 빠른 스크롤 시 프레임 드랍과 빈 셀이 발생합니다.
FlashList는 iOS의 UICollectionView처럼 셀을 재활용합니다 - 빈 영역 없이 매끄러운 스크롤이 가능합니다.
recyclingKey는 셀이 다른 사진으로 재사용될 때 이전 이미지를 클리어하고 새 이미지를 올바르게 로드하도록 합니다.
이제 4가지 접근법을 나란히 비교해보겠습니다.

---

## Slide 13: Results

Comparing all four approaches side by side.
RN Image: 311MB RAM, 3,796ms load time.
useImage: 4,848MB RAM, crash.
expo-image: 182MB RAM, 85ms load time.
Mipmaps: 174MB RAM, 57ms load time - the final optimization.

4가지 접근법의 결과를 한눈에 비교합니다.
RN Image는 RAM 311MB에 로드 시간 3,796ms.
useImage는 RAM 4,848MB로 크래시.
expo-image는 RAM 182MB에 로드 시간 85ms.
밉맵을 추가하면 RAM 174MB, 로드 시간 57ms로 최종 최적화됩니다.

---

## Slide 14: Results Summary

Here's the summary table.
From RN Image to Mipmaps: RAM decreased 44% (311 → 174MB), load time decreased 98% (3,796 → 57ms).
The key insight is that the right image component combined with mipmaps makes the biggest difference.

요약 테이블입니다.
RN Image에서 밉맵까지, RAM은 311MB에서 174MB로 44% 감소, 로드 시간은 3,796ms에서 57ms로 98% 감소했습니다.
핵심은 이미지 컴포넌트 선택과 밉맵 조합이 가장 큰 차이를 만든다는 것입니다.

---

## Slide 15: Lessons Learned

Lessons learned.
First, don't load what you don't display. Use batch loading and ph:// asset references.
Second, the right component matters most. Choose one that resolves asset URIs natively, not through the JavaScript bridge.
Third, match pixel budget to display size. PixelRatio-aware mipmaps bring massive memory savings.
Fourth, recycle, don't recreate. FlashList gives you smooth scrolling with no blank cells, even with thousands of photos.
Fifth, beware of hooks in recycled views. useImage keeps loaded images in memory, and since FlashList reuses cells instead of destroying them, old images pile up until the app crashes.

배운 점을 정리하겠습니다.
첫째, 표시하지 않는 것은 로드하지 마세요. 배치 로딩과 ph:// 에셋 참조를 사용하세요.
둘째, 올바른 컴포넌트 선택이 가장 중요합니다. 에셋 URI를 네이티브에서 직접 처리하는 컴포넌트를 선택하세요.
셋째, 픽셀 예산을 디스플레이 사이즈에 맞추세요. PixelRatio를 고려한 밉맵이 큰 메모리 절감을 가져옵니다.
넷째, 재생성하지 말고 재활용하세요. FlashList는 수천 장의 사진에서도 빈 셀 없이 매끄러운 스크롤을 제공합니다.
다섯째, 재활용되는 뷰에서 훅 사용을 조심하세요. useImage는 로드한 이미지를 메모리에 유지하는데, FlashList는 셀을 파괴하지 않고 재사용하므로 이전 이미지가 누적되어 크래시를 유발합니다.

---

## Slide 16: Thank You

Thank you! Due to time, I won't be taking questions on stage - but please come find me afterwards if you'd like to chat. I'd love to talk!

감사합니다! 시간 관계상 무대에서 질문은 받지 못하지만, 발표 후에 직접 찾아와 주시면 편하게 이야기 나눠요!
