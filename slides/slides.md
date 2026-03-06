---
theme: default
title: "From 2GB to 200MB: Optimizing Large Image Lists in React Native"
info: FOSSASIA Summit 2026
author: Miryang Jung
transition: slide-left
mdc: true
fonts:
  sans: Google Sans Flex
  mono: Fira Code
---

<style>
:root {
  --slidev-theme-primary: #facc15;
}
.accent {
  color: #facc15;
}
.slidev-layout {
  background: #0f0f1a;
  color: #e2e8f0;
}
.slidev-layout h1 {
  color: #f1f5f9;
}
.slidev-layout h2 {
  color: #94a3b8;
}
.slidev-layout h3 {
  color: #facc15;
}
.slidev-layout a {
  color: #facc15;
}
.slidev-layout code:not(pre code) {
  background: #1c1917;
  color: #fde68a;
  padding: 2px 6px;
  border-radius: 4px;
}
.slidev-layout blockquote {
  border-left: 4px solid #facc15;
  background: rgba(250, 204, 21, 0.08);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}
.slidev-layout table th {
  background: rgba(250, 204, 21, 0.15);
  color: #fde68a;
}
.slidev-layout table td {
  border-color: #1e293b;
}
.slidev-layout li::marker {
  color: #facc15;
}
.slidev-layout ol li::marker {
  color: #facc15;
}
.card {
  background: rgba(250, 204, 21, 0.08);
  border: 1px solid rgba(250, 204, 21, 0.25);
  border-radius: 12px;
  padding: 16px;
}
.card-dim {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}
.card-bad {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 12px;
  padding: 16px;
}
.card-good {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: 12px;
  padding: 16px;
}
.metric-bad { color: #f43f5e; font-weight: 700; }
.metric-ok { color: #facc15; font-weight: 700; }
.metric-good { color: #34d399; font-weight: 700; }
</style>

# From <span class="accent">2GB</span> to <span class="accent">200MB</span>

## Optimizing Large Image Lists in React Native

<div class="mt-12 flex items-center justify-center gap-6">
<img src="/profile.jpg" class="w-24 h-24 rounded-full ring-4 ring-yellow-400/50" />
<div class="text-left">

**Miryang Jung**

<span class="accent">Senior Frontend Engineer</span> @ Grandeclip

<span class="op-60">miryang.dev · @MiryangJung</span>

</div>
</div>

<div class="abs-bl m-6 text-sm op-40">FOSSASIA Summit 2026</div>

<!--
Hello, I'm Miryang Jung. I'm a Senior Frontend Engineer at Grandeclip.
I'm so happy to be here in Thailand, the land of Muay Thai. I bought so much boxing gear at Twins - I've been boxing for about a year now.
Today I'll share how we reduced memory usage from over 2GB down to under 200MB when rendering large image lists in React Native. I built a demo app to reproduce each optimization step and measured the results on a real device. The numbers you'll see are from that demo - your exact results may vary depending on device, OS version, and photo library, but the relative improvements should be consistent.

안녕하세요, 정미량입니다. Grandeclip에서 시니어 프론트엔드 엔지니어로 일하고 있습니다.
무에타이의 나라 태국에 와서 정말 기쁩니다. Twins에서 복싱 용품을 잔뜩 샀어요. 복싱 1년차입니다.
오늘은 React Native에서 대량의 이미지를 렌더링할 때 메모리 사용량을 2GB 이상에서 200MB 이하로 줄인 경험을 공유하겠습니다. 각 최적화 단계를 재현하는 데모 앱을 만들어서 실제 기기에서 측정한 결과입니다. 보시게 될 수치는 그 데모에서 나온 것이며, 기기나 OS 버전, 사진 라이브러리에 따라 정확한 수치는 다를 수 있지만 상대적인 개선 폭은 일관될 것입니다.
-->

---
layout: center
---

# Why Build an <span class="accent">In-App Photo Picker</span>?

<div class="grid grid-cols-2 gap-6 mt-8">
<div class="card">

### The Need

- Album-specific image lists
- Masonry layout, variable grid columns
- Multi-select with custom UI

</div>
<div class="card-dim">

### System Picker Limits

- No layout customization
- No custom selection UI
- No performance control

</div>
</div>

<!--
Why build an in-app photo picker?
The system picker has limited customization.
We needed album-specific image lists, masonry layouts, variable grid columns, and other custom UI.
We wanted multi-select with full control over UX and performance.

왜 인앱 포토 피커를 만들어야 했을까요?
시스템 피커는 커스터마이징이 제한적입니다.
앨범별 이미지 리스트, 메이슨리 레이아웃, 그리드 갯수 변환 등 커스텀 UI가 필요했습니다.
멀티셀렉트와 UX를 완전히 제어하기 위해 직접 만들기로 했습니다.
-->

---

# The <span class="accent">Problem</span>

<div class="grid grid-cols-2 gap-8">
<div>

### Naive Implementation

```tsx
<FlatList
  data={allPhotos}       // 1,809 photos
  numColumns={4}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item.uri }}
      style={{ width: 96, height: 96 }}
    />
  )}
/>
```

</div>
<div>

### Result

<div class="card-bad">

- RAM spikes to <span class="metric-bad">~5GB</span>
- App <span class="metric-bad">crashes</span> on scroll
- Every cell loads full-resolution image
- No recycling, no caching

</div>

</div>
</div>

<!--
Let's look at the problem. The simplest implementation - put Image components in a FlatList and render 1,809 photos.
RAM spikes to ~5GB and the app crashes.
Every cell loads full-resolution images with no recycling and no caching.

문제를 보겠습니다. 가장 단순한 구현 - FlatList에 Image 컴포넌트를 넣고 1,809장의 사진을 렌더링하면 어떻게 될까요?
RAM이 5GB까지 치솟고 앱이 크래시됩니다.
모든 셀이 풀 해상도 이미지를 로드하고, 리사이클링도 캐싱도 없기 때문입니다.
-->

---

# How <span class="accent">Other Gallery Apps</span> Solve This

<div class="grid grid-cols-2 gap-6 mt-6">
<div class="space-y-4">

<div class="card">

**1. Index first, load later**

Metadata only, images on demand

</div>

<div class="card">

**2. Low-res thumbnails**

Pre-generated mipmaps at exact display size

</div>

</div>
<div class="space-y-4">

<div class="card">

**3. View recycling**

Reuse cells as you scroll

</div>

<div class="card">

**4. Progressive loading**

Placeholder → Thumbnail → Full resolution

</div>

</div>
</div>

<!--
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
-->

---

# <span class="accent">Batch Loading</span> & Caching

```tsx
const BATCH_SIZE = 50;

const batch = await MediaLibrary.getAssetsAsync({
  first: BATCH_SIZE,
  after: cursor,
  mediaType: "photo",
  sortBy: [["modificationTime", false]],
});

// Return lightweight metadata only
const assets = batch.assets.map((a) => ({
  uri: a.uri,   // ph:// URI (no pixel data yet)
  id: a.id,
}));
```

<div class="card mt-4">

- Load **50 photos at a time**, not all 1,809
- `ph://` URI = **asset reference**, not actual pixels
- Pagination with `endCursor` for infinite scroll

</div>

<!--
First, loading. Instead of loading all 1,809 photos at once, we load 50 at a time.
ph:// URI is just an asset reference - an identifier for a photo in the iOS Photos library. It doesn't contain any pixel data.
We use endCursor pagination for infinite scroll.
Now we have lightweight asset references. But how do we actually render them on screen?

첫 번째, 로딩입니다. 한번에 1,809장을 다 로드하지 않고 50장씩 배치로 로드합니다.
ph:// URI는 iOS Photos 라이브러리의 에셋 식별자일 뿐, 실제 픽셀 데이터가 아닙니다.
endCursor를 이용한 페이지네이션으로 무한 스크롤을 구현합니다.
이제 가벼운 에셋 참조는 확보했습니다. 그런데 이걸 실제로 화면에 어떻게 렌더링할까요?
-->

---

# Rendering: <span class="accent">RN Image</span> + FlashList

<div class="grid grid-cols-2 gap-4">
<div>

```tsx
// Must resolve ph:// → file:// first
const info = await getAssetInfoAsync(id);

<Image source={{ uri: info.localUri }} />
```

<div class="card mt-4">

- No native **ph:// support**
- Resolves URI **per cell** (async JS bridge)
- Avg load: <span class="metric-bad">~3,796ms</span>
- RAM: <span class="metric-ok">~311MB</span>

</div>

</div>
<div>

<video src="/case1.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-yellow-400/20" />

</div>
</div>

<!--
Now, rendering. The first thing I tried was RN Image.
RN Image can't load ph:// URIs directly - it needs getAssetInfoAsync to resolve to file:// first.
This requires an async call per cell, averaging 3,796ms load time. RAM is 311MB.
Almost 4 seconds of blank cells is unacceptable. There must be a better image component.

다음은 렌더링입니다. 처음 시도한 건 RN Image입니다.
RN Image는 ph:// URI를 직접 로드할 수 없어서 getAssetInfoAsync로 file:// URI를 먼저 구해야 합니다.
셀마다 비동기 호출이 필요하고, 평균 로드 시간이 3,796ms입니다. RAM은 311MB입니다.
빈 셀을 4초나 보여주는 건 용납할 수 없습니다. 더 나은 이미지 컴포넌트가 필요합니다.
-->

---

# Rendering: <span class="accent">useImage Trap</span>

<div class="grid grid-cols-2 gap-4">
<div>

```tsx
// Expo issue recommended this approach
function Item({ item }) {
  const image = useImage(item.uri, {
    maxWidth: SCREEN_WIDTH,
  });
  return <ExpoImage source={image} />;
}
```

<div class="card-bad mt-4">

- Loads full-res images, **keeps them in memory**
- FlashList recycles → **old images never freed**
- RAM: <span class="metric-bad">~4,848MB</span> → crash

</div>

</div>
<div>

<video src="/case2.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-red-500/30" />

</div>
</div>

<!--
Still on rendering - the useImage trap.
We initially used useImage because an Expo issue recommended this approach.
useImage loads full-resolution images and keeps them in memory. But FlashList reuses cells instead of destroying them, so old images never get cleaned up - they just pile up. With fast scrolling, images accumulate faster than they're released. It's a memory leak.
RAM spikes to 4,848MB and the app crashes.
We need a component that handles ph:// URIs natively, without this problem.

아직 렌더링 이야기입니다 - useImage 훅의 함정입니다.
처음에 Expo 이슈에서 useImage를 사용하라고 권장해서 이 방식으로 구현했습니다.
useImage는 풀사이즈 이미지를 로드하고 메모리에 유지합니다. 하지만 FlashList는 셀을 파괴하지 않고 재사용하므로, 이전 이미지가 정리되지 않고 쌓입니다. 메모리 누수입니다.
RAM이 4,848MB까지 치솟고 앱이 크래시됩니다.
훅이 아니라, 네이티브에서 ph:// URI를 직접 처리하는 컴포넌트가 필요합니다.
-->

---

# Rendering: <span class="accent">expo-image</span> + FlashList

<div class="grid grid-cols-2 gap-4">
<div>

```tsx
<ExpoImage
  source={{ uri: item.uri }}
  recyclingKey={item.id}
  transition={0}
/>
```

<div class="card-good mt-4">

- Native **ph:// resolution**
- Built-in **view recycling**
- Avg load: <span class="metric-good">~85ms</span>
- RAM: <span class="metric-good">~182MB</span>

</div>

</div>
<div>

<video src="/case3.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-emerald-500/30" />

</div>
</div>

<!--
expo-image resolves ph:// URIs natively - no async JavaScript calls needed.
It supports view recycling, and recyclingKey tells it to clear the old image and load the new one when a cell is reused.
Average load time is 85ms, RAM stays at 182MB. That's 45x faster than RN Image.
But we're still decoding full 12-megapixel photos for tiny thumbnail cells. Can we reduce what we decode?

expo-image는 ph:// URI를 네이티브에서 직접 처리합니다 - 비동기 JavaScript 호출이 필요 없습니다.
뷰 리사이클링을 지원하고, recyclingKey로 셀이 재사용될 때 이전 이미지를 클리어하고 새 이미지를 올바르게 로드합니다.
평균 로드 시간 85ms, RAM 182MB로 안정적입니다. RN Image 대비 45배 빠릅니다.
하지만 여전히 작은 썸네일 셀을 위해 12메가픽셀 풀사이즈를 디코딩하고 있습니다. 디코딩하는 양 자체를 줄일 수 있을까요?
-->

---

# Decoding: <span class="accent">Mipmaps</span>

<div class="grid grid-cols-2 gap-4">
<div>

```tsx
const LAYOUT_WIDTH = SCREEN_WIDTH / 4;
const MIPMAP_WIDTH =
  PixelRatio.getPixelSizeForLayoutSize(LAYOUT_WIDTH);

const context = ImageManipulator.manipulate(uri);
context.resize({ width: MIPMAP_WIDTH });
const image = await context.renderAsync();
const result = await image.saveAsync({
  format: SaveFormat.JPEG, compress: 0.9,
});

// Cache with MMKV
storage.set(cacheKey, destFile.uri);
```

</div>
<div>

### Why Mipmaps?

<div class="card">

- Full image: **4032 x 3024** (12MP)
- Grid cell: **~98 x 98** points
- Mipmap: **~294 x 294** px (3x retina)
- **~170x fewer pixels** to decode
- Cached on disk with MMKV index

</div>

</div>
</div>

<!--
Now, decoding. Original images are 4032x3024, 12 megapixels. But grid cells are only 98x98 points.
We're decoding 12 million pixels when we only need about 86 thousand - roughly 170 times more data than necessary.
The idea is simple - pre-generate a small JPEG thumbnail at exactly the size we need, and reuse it forever. This is called mipmapping.

다음은 디코딩입니다. 원본 이미지는 4032x3024, 12메가픽셀입니다. 하지만 그리드 셀은 98x98 포인트에 불과합니다.
1,200만 픽셀을 디코딩하지만 실제로 필요한 건 약 8만 6천 픽셀 - 약 170배 더 많은 데이터를 처리하는 셈입니다.
아이디어는 간단합니다 - 필요한 정확한 크기의 작은 JPEG 썸네일을 미리 만들어두고 계속 재사용하는 겁니다. 이것을 밉매핑이라고 합니다.
-->

---

# Decoding: Mipmap <span class="accent">Implementation</span>

<div class="grid grid-cols-2 gap-4">
<div>

### Size Calculation

```tsx
// 4-column grid → each cell = 1/4 screen
const LAYOUT_WIDTH = SCREEN_WIDTH / NUM_COLUMNS;

// Logical points → physical pixels
// iPhone 3x: 98pt → 294px
const MIPMAP_WIDTH =
  PixelRatio.getPixelSizeForLayoutSize(LAYOUT_WIDTH);
```

### Cache Key

```tsx
// Width-aware: regenerates if layout changes
const cacheKey = `mipmap_${MIPMAP_WIDTH}_${id}`;
```

</div>
<div>

### Generation Pipeline

```tsx
// 1. Resize to exact display size
const ctx = ImageManipulator.manipulate(uri);
ctx.resize({ width: MIPMAP_WIDTH });
const img = await ctx.renderAsync();

// 2. Save as compressed JPEG (~20-30KB)
const result = await img.saveAsync({
  format: SaveFormat.JPEG, compress: 0.9,
});

// 3. Move to persistent cache dir
resultFile.move(destFile);
storage.set(cacheKey, destFile.uri);
```

<div class="card mt-3">

- Cache-first: skip if MMKV entry + file exists
- 1st launch: generate → 2nd launch: **instant**

</div>

</div>
</div>

<!--
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
-->

---

# Decoding: Mipmaps <span class="accent">Result</span>

<div class="grid grid-cols-2 gap-8 items-center">
<div>

<video src="/case4.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-yellow-400/20" />

</div>
<div>

### Mipmaps + expo-image + FlashList

<div class="card-good">

- RAM: <span class="metric-good">~174MB</span>
- Avg load: <span class="metric-good">~57ms</span>
- **4% less RAM** than expo-image alone
- **33% faster** load time
- Disk-cached → instant on relaunch

</div>

</div>
</div>

<!--
Mipmap results - still on decoding.
RAM 174MB, average load time 57ms.
That's 4% less RAM and 33% faster load time compared to expo-image alone.
And mipmaps are disk-cached, so they load instantly on relaunch.
The final piece that ties this all together is the list component itself.

밉맵 적용 결과입니다 - 디코딩 마무리.
RAM 174MB, 평균 로드 시간 57ms입니다.
expo-image 단독 대비 RAM이 4% 줄고, 로드 시간은 33% 빨라졌습니다.
그리고 밉맵은 디스크에 캐시되므로 앱을 다시 실행해도 즉시 로드됩니다.
이 모든 것을 하나로 묶어주는 마지막 퍼즐은 리스트 컴포넌트입니다.
-->

---

# Scrolling: <span class="accent">FlashList</span>

<div class="grid grid-cols-2 gap-6">
<div>

### FlatList Problems

<div class="card-bad">

```tsx
<FlatList
  data={photos}
  numColumns={4}
  renderItem={renderItem}
/>
```

- No view recycling
- Mounts every cell on scroll
- **Frame drops** on fast scroll

</div>

</div>
<div>

### FlashList Solution

<div class="card-good">

```tsx
<FlashList
  data={photos}
  numColumns={4}
  renderItem={renderItem}
  estimatedItemSize={ITEM_SIZE}
/>
```

- **View recycling** (like native)
- **Smooth scrolling**, no blank cells
- `recyclingKey` for correct updates

</div>

</div>
</div>

<!--
Finally, scrolling. FlatList mounts every cell from scratch on scroll. No view recycling means frame drops and blank cells during fast scrolling.
FlashList recycles cells like iOS UICollectionView - reusing mounted components instead of creating new ones.
The scrolling is smooth with no blank areas. recyclingKey tells expo-image that a cell now represents a different photo, so it clears the old image and loads the new one correctly.
Now let's see how all four approaches compare side by side.

마지막으로 스크롤링입니다. FlatList는 스크롤할 때마다 모든 셀을 새로 마운트합니다. 뷰 리사이클링이 없어서 빠른 스크롤 시 프레임 드랍과 빈 셀이 발생합니다.
FlashList는 iOS의 UICollectionView처럼 셀을 재활용합니다 - 새로 생성하지 않고 마운트된 컴포넌트를 재사용합니다.
스크롤이 매끄럽고 빈 영역이 없습니다. recyclingKey는 셀이 다른 사진으로 재사용될 때 이전 이미지를 클리어하고 새 이미지를 올바르게 로드하도록 합니다.
이제 4가지 접근법을 나란히 비교해보겠습니다.
-->

---

# <span class="accent">Results</span>

<div class="grid grid-cols-4 gap-3 mt-4">

<div class="text-center">
<img src="/case1.png" class="h-64 mx-auto rounded-xl ring-2 ring-yellow-400/20 mb-2" />

**RN Image**

<span class="metric-ok">311MB</span> · <span class="metric-bad">3,796ms</span>
</div>

<div class="text-center">
<img src="/case2.png" class="h-64 mx-auto rounded-xl ring-2 ring-red-500/30 mb-2" />

**useImage**

<span class="metric-bad">4,848MB</span> · <span class="metric-bad">Crash</span>
</div>

<div class="text-center">
<img src="/case3.png" class="h-64 mx-auto rounded-xl ring-2 ring-emerald-500/30 mb-2" />

**expo-image**

<span class="metric-good">182MB</span> · <span class="metric-good">85ms</span>
</div>

<div class="text-center">
<img src="/case4.png" class="h-64 mx-auto rounded-xl ring-2 ring-yellow-400/40 mb-2" />

<span class="accent">**Mipmaps**</span>

<span class="metric-good">174MB</span> · <span class="metric-good">57ms</span>
</div>

</div>

<!--
Comparing all four approaches side by side. These numbers are from a demo app I built to reproduce each step, tested on an iPhone with 1,809 photos. Your exact numbers may differ, but the relative gains should be similar.
RN Image: 311MB RAM, 3,796ms load time.
useImage: 4,848MB RAM, crash.
expo-image: 182MB RAM, 85ms load time.
Mipmaps: 174MB RAM, 57ms load time - the final optimization.

4가지 접근법의 결과를 한눈에 비교합니다. 이 수치들은 각 단계를 재현하기 위해 만든 데모 앱에서 iPhone으로 1,809장의 사진을 테스트한 결과입니다. 정확한 수치는 환경에 따라 다를 수 있지만 상대적 개선 폭은 유사할 것입니다.
RN Image는 RAM 311MB에 로드 시간 3,796ms.
useImage는 RAM 4,848MB로 크래시.
expo-image는 RAM 182MB에 로드 시간 85ms.
밉맵을 추가하면 RAM 174MB, 로드 시간 57ms로 최종 최적화됩니다.
-->

---

# Results <span class="accent">Summary</span>

| | RN Image | useImage | expo-image | **Mipmaps** |
|---|:---:|:---:|:---:|:---:|
| **RAM** | <span class="metric-ok">~311MB</span> | <span class="metric-bad">~4,848MB</span> | <span class="metric-good">~182MB</span> | <span class="metric-good">**~174MB**</span> |
| **Avg Load** | <span class="metric-bad">~3,796ms</span> | <span class="metric-bad">N/A (crash)</span> | <span class="metric-good">~85ms</span> | <span class="metric-good">**~57ms**</span> |
| **Stability** | OK | <span class="metric-bad">Crash</span> | Stable | **Stable** |
| **Scroll** | Janky | N/A | Smooth | **Smooth** |

<div class="card mt-6">

### Key Takeaway

> From RN Image to Mipmaps: RAM **-44%** (311 → 174MB), load time **-98%** (3,796 → 57ms)

</div>

<!--
Here's the summary table.
From RN Image to Mipmaps: RAM decreased 44% (311 → 174MB), load time decreased 98% (3,796 → 57ms).
The key insight is that the right image component combined with mipmaps makes the biggest difference.

요약 테이블입니다.
RN Image에서 밉맵까지, RAM은 311MB에서 174MB로 44% 감소, 로드 시간은 3,796ms에서 57ms로 98% 감소했습니다.
핵심은 이미지 컴포넌트 선택과 밉맵 조합이 가장 큰 차이를 만든다는 것입니다.
-->

---

# <span class="accent">Lessons Learned</span>

<div class="space-y-2 mt-2 text-[0.95rem]">
<div class="card !py-2">

**1. Don't load what you don't display** — Batch loading + `ph://` asset references

</div>
<div class="card !py-2">

**2. Right component matters most** — Native ph:// resolution vs async JS bridge

</div>
<div class="card !py-2">

**3. Match pixel budget to display size** — PixelRatio-aware mipmaps = massive savings

</div>
<div class="card !py-2">

**4. Recycle, don't recreate** — FlashList + `recyclingKey` for smooth scrolling

</div>
<div class="card-bad !py-2">

**5. Beware of hooks in recycled views** — old images pile up → crash

</div>
</div>

<!--
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
-->

---
layout: center
---

<div class="text-center">

# <span class="accent">Thank You!</span>

<br>

<div class="flex items-center justify-center gap-6">
<img src="/profile.jpg" class="w-20 h-20 rounded-full ring-4 ring-yellow-400/50" />
<div class="text-left">

**Miryang Jung**

<span class="op-60">miryang.dev · @MiryangJung</span>

</div>
</div>

<br>

<div class="card inline-block">

Blog: **miryang.dev**

</div>

</div>

<!--
Thank you! Due to time, I won't be taking questions on stage - but please come find me afterwards if you'd like to chat. I'd love to talk!

감사합니다! 시간 관계상 무대에서 질문은 받지 못하지만, 발표 후에 직접 찾아와 주시면 편하게 이야기 나눠요!
-->
