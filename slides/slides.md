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

<div class="abs-bl m-6 text-sm op-40">FOSSASIA Summit 2026</div>

<!--
Hi everyone, thank you for being here!<br>
We were building an in-app gallery.<br>
Users scroll through their photos, pick one, done. Simple, right?<br>
But when they scrolled fast, the app crashed. Just gone.<br>
That's a terrible experience.<br>
So we had to fix it. And today, I want to share what we learned.<br>

(하이 에브리원, 땡큐 포 빙 히어!<br>
위 워 빌딩 언 인앱 **갤러리**.<br>
유저즈 스크롤 쓰루 데어 포토즈, 픽 원, 던. **심플**, 롸잇?<br>
벗 웬 데이 스크롤드 **패스트**, 디 앱 **크래시드**. 저스트 곤.<br>
댓츠 어 **테러블** 익스피리언스.<br>
쏘 위 해드 투 픽스 잇. 앤드 투데이, 아이 원트 투 셰어 왓 위 **런드**.)<br>

안녕하세요, 와주셔서 감사합니다!<br>
저희가 인앱 갤러리를 만들고 있었습니다.<br>
사진을 스크롤하고, 하나 고르고, 끝. 간단하죠?<br>
그런데 빠르게 스크롤하면 앱이 크래시되었습니다.<br>
그냥 꺼져버렸어요.<br>
끔찍한 경험이죠.<br>
그래서 고쳐야 했고, 오늘 그 과정에서 배운 것들을 공유하려 합니다.<br>
-->

---

# <span class="accent">About Me</span>

<div class="mt-8 flex flex-col items-center justify-center gap-6">
<img src="/profile.jpg" class="w-44 h-44 rounded-full ring-4 ring-yellow-400/50" />
<div class="text-center">

<div class="text-3xl font-bold">Miryang Jung</div>

<div class="text-xl mt-2"><span class="accent">Senior Frontend Engineer</span> @ Grandeclip</div>

<div class="text-lg op-60 mt-1">miryang.dev · @MiryangJung</div>

</div>
</div>


<!--
I'm Miryang Jung. I'm a Senior Frontend Engineer at Grandeclip.<br>
I'm really happy to be here in Thailand. This is the land of Muay Thai!<br>
I bought a lot of boxing gear at Twins.<br>
I've been boxing for about a year now. So this trip is extra special for me.<br>
For this talk, I built a demo app. It shows each step of the fix.<br>
I tested it on a simulator. Your numbers may be different. But the pattern should be the same.<br>
OK, let's get into it.<br>

(아임 미량 정. 아임 어 **시니어** 프론트엔드 엔지니어 앳 그랑드클립.<br>
아임 리얼리 해피 투 비 히어 인 **타일랜드**. 디스 이즈 더 랜드 오브 무에타이!<br>
아이 봇 어 랏 오브 복싱 기어 앳 트윈스.<br>
아이브 빈 복싱 포 어바웃 어 이어 나우. 쏘 디스 트립 이즈 엑스트라 **스페셜** 포 미.<br>
포 디스 톡, 아이 빌트 어 데모 앱. 잇 쇼즈 이치 스텝 오브 더 픽스.<br>
아이 **테스티드** 잇 온 어 **시뮬레이터**. 유어 넘버즈 메이 비 **디퍼런트**. 벗 더 **패턴** 슈드 비 더 세임.<br>
오케이, 렛츠 겟 인투 잇.)<br>

저는 정미량입니다.<br>
Grandeclip에서 시니어 프론트엔드 엔지니어로 일하고 있습니다.<br>
태국에 와서 정말 기쁩니다. 무에타이의 나라!<br>
Twins에서 복싱 용품을 잔뜩 샀어요.<br>
복싱 **1**년차라 이번 여행이 특별합니다.<br>
이 발표를 위해 데모 앱을 만들었습니다.<br>
각 단계를 보여주고 시뮬레이터에서 테스트했습니다.<br>
수치는 다를 수 있지만 패턴은 같을 겁니다.<br>
자, 시작하겠습니다.<br>
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
Why did we build our own photo picker?<br>
The system picker on iOS and Android works fine for simple cases. But it has limits.<br>
We needed custom album lists.<br>
We needed masonry layouts and different grid sizes.<br>
We needed multi-select with our own UI.<br>
The system picker can't do any of that.<br>
So we built our own gallery. And that's when the problems started.<br>

(와이 디드 위 빌드 아워 오운 포토 **피커**?<br>
더 시스템 피커 온 아이오에스 앤드 안드로이드 웍스 파인 포 심플 케이시즈. 벗 잇 해즈 **리밋츠**.<br>
위 니디드 커스텀 앨범 리스츠.<br>
위 니디드 **메이슨리** 레이아웃츠 앤드 디퍼런트 그리드 사이지즈.<br>
위 니디드 멀티-셀렉트 위드 아워 오운 유아이.<br>
더 시스템 피커 캔트 두 에니 오브 댓.<br>
쏘 위 빌트 아워 오운 갤러리. 앤드 댓츠 웬 더 프라블럼즈 **스타티드**.)<br>

왜 직접 포토 피커를 만들었을까요?<br>
iOS와 Android의 시스템 피커는 간단한 경우에는 잘 작동합니다.<br>
하지만 한계가 있습니다.<br>
커스텀 앨범 리스트, 메이슨리 레이아웃, 다양한 그리드 크기가 필요했습니다.<br>
우리만의 UI로 멀티 셀렉트도 필요했습니다.<br>
시스템 피커로는 불가능합니다.<br>
그래서 직접 만들었고, 그때부터 문제가 시작됐습니다.<br>
-->

---

# The <span class="accent">Problem</span>

<div class="grid grid-cols-2 gap-8">
<div>

### Naive Implementation

```tsx
<FlashList
  data={allPhotos}       // 1,809 photos
  numColumns={4}
  estimatedItemSize={96}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item.uri }}  // ph:// URI
      style={{ width: 96, height: 96 }}
    />
  )}
/>
```

</div>
<div>

### Result

<div class="card-bad">

- RAM peaks at <span class="metric-bad">~2.3GB</span>
- <span class="metric-bad">Blank cells</span> for over 2 seconds
- Every cell loads full-resolution image
- Async URI resolution per cell

</div>

</div>
</div>

<!--
Here is the simplest code.<br>
We put RN Image in a FlashList. We load **1,809** photos from the device.<br>
What happens? The screen is blank for over **2** seconds.<br>
Then RAM jumps to **2.3** gigabytes.<br>
After the peak, it goes back down to **311** megabytes. But the loading is terrible.<br>
Why? RN Image can't use ph:// URIs directly.<br>
It needs an async call for each photo to get the file path first.<br>
And each cell loads the full-size photo — **8** to **24** megapixels — just for a tiny thumbnail.<br>
This won't work. How do we fix it?<br>

(히어 이즈 더 **심플리스트** 코드.<br>
위 풋 아알엔 이미지 인 어 플래시리스트. 위 로드 **에이틴헌드레드앤나인** 포토즈 프롬 더 디바이스.<br>
왓 해픈즈? 더 스크린 이즈 **블랭크** 포 오버 **투** 세컨즈.<br>
덴 램 점프스 투 **투-포인트-쓰리** **기가바이츠**.<br>
애프터 더 피크, 잇 고즈 백 다운 투 **쓰리헌드레드일레븐** 메가바이츠. 벗 더 로딩 이즈 **테리블**.<br>
와이? 아알엔 이미지 캔트 유즈 피에이치 유아아이즈 디**렉틀리**.<br>
잇 니즈 언 어**싱크** 콜 포 이치 포토 투 겟 더 파일 패쓰 퍼스트.<br>
앤드 이치 셀 로즈 더 풀사이즈 포토 — **에잇** 투 **트웬티포** **메가픽셀즈** — 저스트 포 어 타이니 **썸네일**.<br>
디스 원트 워크. 하우 두 위 **픽스** 잇?)<br>

가장 간단한 코드입니다.<br>
FlashList에 RN Image를 넣고 기기에서 **1,809**장의 사진을 로드합니다.<br>
결과는? 화면이 **2**초 넘게 비어있습니다.<br>
RAM이 **2.3**기가바이트까지 올라갑니다.<br>
피크 후 **311**메가바이트로 내려오지만 로딩 경험은 최악입니다.<br>
왜? RN Image는 ph:// URI를 직접 쓸 수 없습니다.<br>
각 사진마다 파일 경로를 얻기 위한 비동기 호출이 필요합니다.<br>
그리고 각 셀이 **8**~**24**메가픽셀의 풀사이즈 사진을 작은 썸네일을 위해 로드합니다.<br>
이건 안 됩니다. 어떻게 고칠까요?<br>
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
Before we write code, let's look at how other gallery apps do it.<br>
They show thousands of photos smoothly. How?<br>
First, they load metadata only. The real image data comes later.<br>
Second, they use small thumbnails that match the display size.<br>
Third, they recycle views. When a cell scrolls away, it gets reused for a new photo.<br>
Fourth, they load step by step. Placeholder first, then thumbnail, then full image.<br>
We will use these same ideas in React Native.<br>

(비포 위 라이트 코드, 렛츠 룩 앳 하우 아더 갤러리 앱스 두 잇.<br>
데이 쇼 **타우전즈** 오브 포토즈 **스무들리**. 하우?<br>
퍼스트, 데이 로드 **메타데이터** 온리. 더 리얼 이미지 데이터 컴즈 레이터.<br>
세컨드, 데이 유즈 스몰 **썸네일즈** 댓 매치 더 디스플레이 사이즈.<br>
써드, 데이 **리사이클** 뷰즈. 웬 어 셀 스크롤즈 어웨이, 잇 겟츠 리유즈드 포 어 뉴 포토.<br>
포쓰, 데이 로드 스텝 바이 스텝. 플레이스홀더 퍼스트, 덴 썸네일, 덴 풀 이미지.<br>
위 윌 유즈 디즈 세임 아이**디어즈** 인 리액트 네이티브.)<br>

코드를 작성하기 전에, 다른 갤러리 앱들은 어떻게 하는지 살펴봅시다.<br>
수천 장의 사진을 매끄럽게 보여줍니다. 어떻게?<br>
첫째, 메타데이터만 먼저 로드합니다. 실제 이미지 데이터는 나중에.<br>
둘째, 디스플레이 크기에 맞는 작은 썸네일을 사용합니다.<br>
셋째, 뷰를 재활용합니다.<br>
넷째, 단계별로 로드합니다.<br>
우리도 같은 아이디어를 React Native에 적용할 겁니다.<br>
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
First step: loading.<br>
We don't load all **1,809** photos at once. We use expo-media-library to load **50** at a time.<br>
Here's the key point. The ph:// URI is just a reference.<br>
It's like an ID for a photo in the iOS Photos library.<br>
It has no pixel data. No memory is used until we try to show it.<br>
We use endCursor to load the next page. This gives us infinite scroll.<br>
This is our base. Light references, not heavy image data.<br>
Now we have the references. But how do we show them on screen?<br>

(퍼스트 스텝: **로딩**.<br>
위 돈트 로드 올 **에이틴헌드레드앤나인** 포토즈 앳 원스. 위 유즈 엑스포-미디어-라이브러리 투 로드 **피프티** 앳 어 타임.<br>
히어즈 더 키 포인트. 더 피에이치 유아아이 이즈 저스트 어 **레퍼런스**.<br>
잇츠 라이크 언 아이디 포 어 포토 인 더 아이오에스 포토즈 라이브러리.<br>
잇 해즈 노 **픽셀** 데이터. 노 메모리 이즈 유즈드 언틸 위 트라이 투 쇼 잇.<br>
위 유즈 엔드커서 투 로드 더 넥스트 페이지. 디스 기브즈 어스 **인피닛** 스크롤.<br>
디스 이즈 아워 베이스. 라이트 **레퍼런시즈**, 낫 헤비 이미지 데이터.<br>
나우 위 해브 더 레퍼런시즈. 벗 하우 두 위 쇼 뎀 온 스크린?)<br>

첫 번째 단계: 로딩.<br>
**1,809**장을 한번에 로드하지 않습니다.<br>
expo-media-library로 **50**장씩 로드합니다.<br>
핵심은 이겁니다. ph:// URI는 참조일 뿐입니다.<br>
iOS Photos 라이브러리의 사진 ID 같은 것입니다.<br>
픽셀 데이터가 없습니다.<br>
표시하기 전까지 메모리를 사용하지 않습니다.<br>
endCursor로 다음 페이지를 로드합니다.<br>
이것이 무한 스크롤이 됩니다.<br>
이것이 기반입니다.<br>
이제 참조는 있습니다. 그런데 어떻게 화면에 보여줄까요?<br>
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
Next: rendering. I first tried the built-in RN Image.<br>
The problem? RN Image can't use ph:// URIs on iOS.<br>
You need to call getAssetInfoAsync first.<br>
This turns the ph:// URI into a file path. That's an async call for every cell.<br>
Look at the demo. The average load time is **3,796** milliseconds.<br>
That's almost **4** seconds of blank cells.<br>
RAM is **311** megabytes. Not too bad. But the scrolling is not smooth.<br>
**4** seconds of blank cells is not good enough. We need a better image component.<br>

(넥스트: **렌더링**. 아이 퍼스트 트라이드 더 빌트인 아알엔 이미지.<br>
더 프라블럼? 아알엔 이미지 캔트 유즈 피에이치 유아아이즈 온 아이오에스.<br>
유 니드 투 콜 겟에셋인포어싱크 퍼스트.<br>
디스 턴즈 더 피에이치 유아아이 인투 어 파일 패쓰. 댓츠 언 어**싱크** 콜 포 에브리 셀.<br>
룩 앳 더 데모. 디 **애버리지** 로드 타임 이즈 **써티세븐헌드레드나인티식스** 밀리세컨즈.<br>
댓츠 올모스트 **포** 세컨즈 오브 블랭크 셀즈.<br>
램 이즈 **쓰리헌드레드일레븐** 메가바이츠. 낫 투 배드. 벗 더 스크롤링 이즈 낫 스무드.<br>
**포** 세컨즈 오브 블랭크 셀즈 이즈 낫 굿 이너프. 위 니드 어 **베터** 이미지 컴포넌트.)<br>

다음: 렌더링.<br>
먼저 내장 RN Image를 시도했습니다.<br>
문제? RN Image는 iOS에서 ph:// URI를 사용할 수 없습니다.<br>
getAssetInfoAsync를 먼저 호출해야 합니다.<br>
ph:// URI를 파일 경로로 바꿔야 하죠. 모든 셀마다 비동기 호출이 필요합니다.<br>
데모를 보세요. 평균 로드 시간이 **3,796**밀리초입니다.<br>
거의 **4**초간 빈 셀입니다.<br>
RAM은 **311**메가바이트. 나쁘진 않지만 스크롤이 매끄럽지 않습니다.<br>
**4**초간 빈 셀은 부족합니다. 더 나은 이미지 컴포넌트가 필요합니다.<br>
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

- Hook manages image as **JS-side state**
- FlashList recycles → **component never unmounts**
- Old image refs **never cleaned up** → RAM piles up
- RAM: <span class="metric-bad">~4,848MB</span> → crash

</div>

</div>
<div>

<video src="/case2.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-red-500/30" />

</div>
</div>

<!--
Still on rendering. I looked for other options.<br>
I found an Expo GitHub issue about the memory problem.<br>
Someone suggested using the useImage hook from expo-image. It sounded promising.<br>
But when I used useImage with FlashList, it was a disaster.<br>
RAM went up to **4,848** megabytes. That's almost **5** gigs.<br>
The app crashed right away.<br>
Why? useImage is a React hook. It manages image loading as component state.<br>
But FlashList recycles cells. It doesn't unmount them.<br>
So the hook never cleans up. Old image references stay in memory.<br>
They keep piling up. It's a memory leak.<br>
The lesson: be careful with hooks in recycled views.<br>
We need a component that handles images on the native side, not through JS state.<br>

(스틸 온 렌더링. 아이 룩트 포 아더 **옵션즈**.<br>
아이 파운드 언 엑스포 깃헙 이슈 어바웃 더 메모리 프라블럼.<br>
**썸원** 서제스티드 유징 더 유즈이미지 훅 프롬 엑스포-이미지. 잇 **사운디드** 프라미싱.<br>
벗 웬 아이 유즈드 유즈이미지 위드 플래시리스트, 잇 워즈 어 디**재스터**.<br>
램 웬트 업 투 **포타우전드에잇헌드레드포티에잇** 메가바이츠. 댓츠 올모스트 **파이브** 기그즈.<br>
디 앱 크래시드 라이트 어**웨이**.<br>
와이? 유즈이미지 이즈 어 리액트 훅. 잇 매니지즈 이미지 로딩 애즈 컴포넌트 **스테이트**.<br>
벗 플래시리스트 리사이클즈 셀즈. 잇 더전트 **언마운트** 뎀.<br>
쏘 더 훅 네버 클린즈 업. 올드 이미지 레퍼런시즈 스테이 인 메모리.<br>
데이 킵 **파일링** 업. 잇츠 어 메모리 **리크**.<br>
더 레슨: 비 **케어풀** 위드 훅스 인 리사이클드 뷰즈.<br>
위 니드 어 컴포넌트 댓 핸들즈 이미지즈 온 더 **네이티브** 사이드, 낫 쓰루 제이에스 스테이트.)<br>

아직 렌더링입니다.<br>
다른 옵션을 찾았습니다.<br>
Expo GitHub 이슈에서 메모리 문제에 대해 논의 중이었고, useImage 훅을 추천했습니다.<br>
좋은 방법처럼 보였습니다.<br>
하지만 useImage와 FlashList를 함께 쓰니 재앙이었습니다.<br>
RAM이 **4,848**메가바이트까지 올랐습니다. 거의 **5**기가.<br>
앱이 바로 크래시됩니다.<br>
왜? useImage는 React 훅입니다. 이미지 로딩을 컴포넌트 상태로 관리합니다.<br>
하지만 FlashList는 셀을 재사용하지 언마운트하지 않습니다.<br>
훅이 정리되지 않습니다. 이전 이미지 참조가 메모리에 남아 계속 쌓입니다. 메모리 누수입니다.<br>
교훈: 재활용되는 뷰에서 훅 사용을 주의하세요.<br>
JS 상태가 아닌 네이티브에서 이미지를 처리하는 컴포넌트가 필요합니다.<br>
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

- Native **ph:// resolution** — no async JS calls
- Requests **display-sized** image from iOS, not full-res
- Built-in **view recycling** with `recyclingKey`
- Avg load: <span class="metric-good">~85ms</span>
- RAM: <span class="metric-good">~182MB</span>

</div>

</div>
<div>

<video src="/case3.mov" autoplay loop muted class="h-[26rem] mx-auto rounded-xl ring-2 ring-emerald-500/30" />

</div>
</div>

<!--
The answer is simple. Use the expo-image component directly. Not through a hook.<br>
expo-image handles ph:// URIs on the native side. No async JavaScript calls.<br>
And here's the key — it doesn't load the full **24** megapixel image.<br>
It uses iOS PHImageManager with a target size matching the view.<br>
So it only requests the pixels it actually needs for display.<br>
It also supports view recycling with the recyclingKey prop.<br>
When a cell is reused, recyclingKey tells expo-image to clear the old image and load the new one.<br>
The results are great.<br>
Load time: **85** milliseconds. That's **45** times faster than RN Image.<br>
RAM: **182** megabytes. Smooth scrolling.<br>
But every time a cell appears, iOS still has to fetch and resize the photo from the library.<br>
Can we skip that step entirely?<br>

(디 앤서 이즈 **심플**. 유즈 디 엑스포-이미지 컴포넌트 디렉틀리. 낫 쓰루 어 훅.<br>
엑스포-이미지 핸들즈 피에이치 유아아이즈 온 더 네이티브 사이드. 노 어싱크 자바스크립트 콜즈.<br>
앤드 히어즈 더 키 — 잇 더전트 로드 더 풀 **트웬티포** 메가픽셀 이미지.<br>
잇 유지즈 아이오에스 피에이치이미지매니저 위드 어 타겟 사이즈 매칭 더 뷰.<br>
쏘 잇 온리 리퀘스츠 더 픽셀즈 잇 **액추얼리** 니즈 포 디스플레이.<br>
잇 올소 서포츠 뷰 리사이클링 위드 더 리사이클링키 프랍.<br>
웬 어 셀 이즈 리유즈드, 리사이클링키 텔즈 엑스포-이미지 투 클리어 디 올드 이미지 앤드 로드 더 뉴 원.<br>
더 리절츠 아 **그레이트**.<br>
로드 타임: **에이티파이브** 밀리세컨즈. 댓츠 **포티파이브** 타임즈 **패스터** 댄 아알엔 이미지.<br>
램: **원에이티투** 메가바이츠. 스무드 스크롤링.<br>
벗 에브리 타임 어 셀 어피어즈, 아이오에스 스틸 해즈 투 페치 앤드 리사이즈 더 포토 프롬 더 라이브러리.<br>
캔 위 스킵 댓 스텝 인**타이얼리**?)<br>

답은 간단합니다. expo-image 컴포넌트를 직접 사용하세요. 훅을 통하지 말고.<br>
expo-image는 네이티브에서 ph:// URI를 처리합니다. 비동기 JavaScript 호출이 없습니다.<br>
핵심은 — 풀사이즈 **24**메가픽셀 이미지를 로드하지 않는다는 것입니다.<br>
iOS PHImageManager를 사용하여 뷰 크기에 맞는 이미지만 요청합니다.<br>
디스플레이에 실제로 필요한 픽셀만 가져옵니다.<br>
recyclingKey 프랍으로 뷰 리사이클링도 지원합니다.<br>
셀이 재사용되면 recyclingKey가 이전 이미지를 클리어하고 새 이미지를 로드하도록 합니다.<br>
결과가 좋습니다.<br>
로드 시간: **85**밀리초. RN Image보다 **45**배 빠릅니다.<br>
RAM: **182**메가바이트. 스크롤도 매끄럽습니다.<br>
하지만 새 셀이 나타날 때마다 iOS가 여전히 포토 라이브러리에서 사진을 가져와 리사이즈해야 합니다.<br>
이 단계를 완전히 건너뛸 수 있을까요?<br>
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

- expo-image asks iOS to resize **every time**
- Mipmap: pre-generated **~294 x 294** px JPEG
- **~20–30 KB** — loads faster than PHImageManager
- **Disk-cached** → instant on relaunch
- Easy to **reuse** across any screen in the app

</div>

</div>
</div>

<!--
Now, decoding. This is where mipmaps take it further.<br>
expo-image already asks iOS for a smaller version. That's great.<br>
But every time a new cell appears, iOS still has to find the photo in the library, resize it, and return it.<br>
What if we pre-generate small JPEG thumbnails and cache them on disk?<br>
That's mipmapping. One-time cost, then reuse forever.<br>
Our grid cell is **98** by **98** points. On a **3x** retina screen, that's **294** by **294** pixels.<br>
We make a small JPEG at exactly that size. About **20** to **30** kilobytes.<br>
On second launch, the thumbnails are already on disk. No waiting for PHImageManager.<br>
And these cached images are easy to reuse anywhere in the app — different screens, different components.<br>

(나우, **디코딩**. 디스 이즈 웨어 밉맵스 테이크 잇 **퍼더**.<br>
엑스포-이미지 올레디 애스크스 아이오에스 포 어 스몰러 **버전**. 댓츠 그레이트.<br>
벗 에브리 타임 어 뉴 셀 어피어즈, 아이오에스 스틸 해즈 투 파인드 더 포토 인 더 라이브러리, 리사이즈 잇, 앤드 리턴 잇.<br>
왓 이프 위 프리-**제너레이트** 스몰 제이펙 썸네일즈 앤드 캐시 뎀 온 디스크?<br>
댓츠 **밉매핑**. 원-타임 코스트, 덴 리유즈 포에버.<br>
아워 그리드 셀 이즈 **나인티에잇** 바이 **나인티에잇** 포인츠. 온 어 **쓰리엑스** 레티나 스크린, 댓츠 **투헌드레드나인티포** 바이 **투헌드레드나인티포** 픽셀즈.<br>
위 메이크 어 스몰 제이펙 앳 이잭틀리 댓 사이즈. 어바웃 **트웬티** 투 **써티** 킬로바이츠.<br>
온 세컨드 론치, 더 썸네일즈 아 올레디 온 디스크. 노 웨이팅 포 피에이치이미지매니저.<br>
앤드 디즈 캐시드 이미지즈 아 이지 투 리유즈 **애니웨어** 인 디 앱 — 디퍼런트 스크린즈, 디퍼런트 컴포넌츠.)<br>

이제 디코딩입니다. 밉맵으로 한 단계 더 나아갑니다.<br>
expo-image는 이미 iOS에 작은 버전을 요청합니다. 좋습니다.<br>
하지만 새 셀이 나타날 때마다 iOS가 포토 라이브러리에서 사진을 찾아 리사이즈하고 반환해야 합니다.<br>
작은 JPEG 썸네일을 미리 생성하고 디스크에 캐싱하면 어떨까요?<br>
이것이 밉매핑입니다. 한 번만 생성하고 영원히 재사용합니다.<br>
그리드 셀은 **98**x**98** 포인트입니다. **3x** 레티나 화면에서 **294**x**294** 픽셀입니다.<br>
정확히 그 크기로 작은 JPEG를 만듭니다. 약 **20~30**킬로바이트입니다.<br>
두 번째 실행에서는 썸네일이 이미 디스크에 있습니다. PHImageManager를 기다릴 필요가 없습니다.<br>
그리고 이 캐싱된 이미지는 앱 어디서든 쉽게 재사용할 수 있습니다 — 다른 화면, 다른 컴포넌트에서.<br>
-->

---

# Decoding: Mipmap <span class="accent">Size Calculation</span>

<div class="grid grid-cols-2 gap-4">
<div>

```tsx
// 4-column grid → each cell = 1/4 screen
const LAYOUT_WIDTH = SCREEN_WIDTH / NUM_COLUMNS;

// Logical points → physical pixels
// iPhone 3x: 98pt → 294px
// iPhone 2x: 98pt → 196px
const MIPMAP_WIDTH =
  PixelRatio.getPixelSizeForLayoutSize(LAYOUT_WIDTH);

// Width-aware: regenerates if layout changes
const cacheKey = `mipmap_${MIPMAP_WIDTH}_${id}`;
```

</div>
<div>

### Why PixelRatio?

<div class="card">

- Different devices have different pixel densities
- **3x** (iPhone Pro): 98pt → **294px**
- **2x** (iPhone SE): 98pt → **196px**
- Generate at **exact screen resolution** — not bigger, not smaller

</div>

<div class="card mt-3">

### Adaptive Cache Key

- Includes `MIPMAP_WIDTH` in key
- Layout change (4 → 3 cols) → **auto-regenerate**
- Device change → correct size automatically

</div>

</div>
</div>

<!--
First step: figure out the right size.<br>
We divide the screen width by **4**. That's our grid cell width.<br>
Then we use PixelRatio to turn points into pixels.<br>
This is important. Different devices have different pixel density.<br>
iPhone Pro is **3x**. So **98** points becomes **294** pixels.<br>
iPhone SE is **2x**. So **98** points becomes **196** pixels.<br>
We make thumbnails at the exact size each device needs. Not bigger. Not smaller.<br>
The cache key has the mipmap width in it.<br>
If the grid changes — say from **4** columns to **3** — the key changes too.<br>
New thumbnails are made at the right size.<br>

(퍼스트 스텝: **피겨** 아웃 더 라이트 사이즈.<br>
위 디바이드 더 스크린 위드쓰 바이 **포**. 댓츠 아워 그리드 셀 위드쓰.<br>
덴 위 유즈 픽셀레이쇼 투 턴 포인츠 인투 픽셀즈.<br>
디스 이즈 임**포턴트**. 디퍼런트 디바이시즈 해브 디퍼런트 픽셀 **덴시티**.<br>
아이폰 프로 이즈 **쓰리엑스**. 쏘 **나인티에잇** 포인츠 비컴즈 **투헌드레드나인티포** 픽셀즈.<br>
아이폰 에스이 이즈 **투엑스**. 쏘 **나인티에잇** 포인츠 비컴즈 **원헌드레드나인티식스** 픽셀즈.<br>
위 메이크 썸네일즈 앳 디 이잭트 사이즈 이치 디바이스 니즈. 낫 비거. 낫 스몰러.<br>
더 캐시 키 해즈 더 밉맵 위드쓰 인 잇.<br>
이프 더 그리드 체인지즈 — 세이 프롬 **포** 컬럼즈 투 **쓰리** — 더 키 체인지즈 투.<br>
뉴 썸네일즈 아 메이드 앳 더 라이트 사이즈.)<br>

첫 단계: 올바른 사이즈를 계산합니다.<br>
화면 너비를 **4**로 나눕니다. 그것이 그리드 셀 너비입니다.<br>
그리고 PixelRatio로 포인트를 픽셀로 변환합니다.<br>
이것이 중요합니다. 기기마다 픽셀 밀도가 다릅니다.<br>
iPhone Pro는 **3x**. **98**포인트가 **294**픽셀이 됩니다.<br>
iPhone SE는 **2x**. **98**포인트가 **196**픽셀이 됩니다.<br>
각 기기가 필요한 정확한 사이즈로 썸네일을 만듭니다.<br>
캐시 키에 밉맵 너비가 포함됩니다.<br>
그리드가 바뀌면 — **4** 컬럼에서 **3**으로 — 키도 바뀌고 새 썸네일이 올바른 크기로 만들어집니다.<br>
-->

---

# Decoding: Mipmap <span class="accent">Generation & Caching</span>

<div class="grid grid-cols-2 gap-4">
<div>

### Generation Pipeline

```tsx
// 1. Resize to exact display size
const ctx = ImageManipulator.manipulate(uri);
ctx.resize({ width: MIPMAP_WIDTH });
const img = await ctx.renderAsync();

// 2. Save as compressed JPEG
const result = await img.saveAsync({
  format: SaveFormat.JPEG, compress: 0.9,
});

// 3. Move to persistent cache dir
resultFile.move(destFile);
storage.set(cacheKey, destFile.uri);
```

</div>
<div>

### Caching Strategy

<div class="card">

**Cache-first approach**

1. Check MMKV for `cacheKey`
2. Verify file exists on disk
3. If both → **skip generation**
4. If not → generate + save + index

</div>

<div class="card mt-3">

**File size savings**

- Original: **1.5–4 MB** per photo
- Mipmap: **~20–30 KB** per photo
- 1,809 photos → **~40 MB** disk cache

</div>

<div class="card mt-3">

- Batch 10 photos at a time via `Promise.all`
- 1st launch: generate → 2nd launch: **instant**

</div>

</div>
</div>

<!--
Now, the pipeline.<br>
We use expo-image-manipulator to resize each photo.<br>
We save it as a JPEG at **90** percent quality.<br>
The result is tiny. About **20** to **30** kilobytes. The original is **1.5** to **4** megabytes.<br>
Each mipmap is saved to the app's folder.<br>
We use MMKV to track them. MMKV is a fast key-value store.<br>
We always check the cache first. If the file is there, we skip it. No need to make it again.<br>
We process **10** photos at a time with Promise.all.<br>
For **1,809** photos, the total cache is only about **40** megabytes on disk.<br>
First launch takes a few seconds. But after that, everything loads from cache right away.<br>

(나우, 더 **파이프라인**.<br>
위 유즈 엑스포-이미지-머니풀레이터 투 리사이즈 이치 포토.<br>
위 세이브 잇 애즈 어 제이펙 앳 **나인티** 퍼센트 **퀄리티**.<br>
더 리절트 이즈 **타이니**. 어바웃 **트웬티** 투 **써티** 킬로바이츠. 디 오리지널 이즈 **원-포인트-파이브** 투 **포** 메가바이츠.<br>
이치 밉맵 이즈 세이브드 투 디 앱스 폴더.<br>
위 유즈 엠엠케이브이 투 트랙 뎀. 엠엠케이브이 이즈 어 패스트 키-밸류 스토어.<br>
위 올웨이즈 체크 더 캐시 퍼스트. 이프 더 파일 이즈 데어, 위 스킵 잇. 노 니드 투 메이크 잇 어겐.<br>
위 프라세스 **텐** 포토즈 앳 어 타임 위드 프라미스닷올.<br>
포 **에이틴헌드레드앤나인** 포토즈, 더 토탈 캐시 이즈 온리 어바웃 **포티** 메가바이츠 온 디스크.<br>
퍼스트 론치 테이크스 어 퓨 세컨즈. 벗 애프터 댓, 에브리띵 로즈 프롬 캐시 라이트 어웨이.)<br>

파이프라인입니다.<br>
expo-image-manipulator로 각 사진을 리사이즈합니다.<br>
**90%** 품질의 JPEG로 저장합니다.<br>
결과는 아주 작습니다. 약 **20~30**킬로바이트.<br>
원본은 **1.5~4**메가바이트입니다.<br>
각 밉맵은 앱 폴더에 저장합니다.<br>
MMKV로 추적합니다. MMKV는 빠른 키-밸류 저장소입니다.<br>
항상 캐시를 먼저 확인합니다. 파일이 있으면 건너뜁니다.<br>
Promise.all로 한 번에 **10**장씩 처리합니다.<br>
**1,809**장 전체 캐시는 디스크에 약 **40**메가바이트입니다.<br>
첫 실행은 몇 초 걸립니다.<br>
하지만 그 이후에는 캐시에서 바로 로드됩니다.<br>
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
- **33% faster** load time — skip PHImageManager
- Disk-cached → **instant on relaunch**
- Reusable across any screen

</div>

</div>
</div>

<!--
Here are the results.<br>
RAM: **174** megabytes. That's **4%** less than expo-image alone.<br>
Load time: **57** milliseconds. **33%** faster.<br>
But the real win is the second launch.<br>
Mipmaps are saved on disk. MMKV tracks them.<br>
So the gallery loads almost right away next time. No more waiting.<br>
The last piece is the list component.<br>

(히어 아 더 리절츠.<br>
램: **원세븐티포** 메가바이츠. 댓츠 **포** 퍼센트 레스 댄 엑스포-이미지 얼론.<br>
로드 타임: **피프티세븐** 밀리세컨즈. **써티쓰리** 퍼센트 **패스터**.<br>
벗 더 리얼 **윈** 이즈 더 세컨드 론치.<br>
밉맵스 아 세이브드 온 디스크. 엠엠케이브이 트랙스 뎀.<br>
쏘 더 갤러리 로즈 올모스트 라이트 어웨이 넥스트 타임. 노 모어 웨이팅.<br>
더 라스트 피스 이즈 더 리스트 컴포넌트.)<br>

결과입니다.<br>
RAM: **174**메가바이트. expo-image 단독 대비 **4%** 적습니다.<br>
로드 시간: **57**밀리초. **33%** 빠릅니다.<br>
하지만 진짜 이점은 두 번째 실행입니다.<br>
밉맵이 디스크에 저장됩니다. MMKV가 추적합니다.<br>
다음에 갤러리가 거의 바로 로드됩니다.<br>
마지막 조각은 리스트 컴포넌트입니다.<br>
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
Last part: scrolling.<br>
FlatList creates a new component for every cell.<br>
When a cell scrolls away, it's destroyed.<br>
With many photos, this means dropped frames and blank cells.<br>
FlashList is different. It works like UICollectionView on iOS.<br>
When a cell scrolls away, it reuses that cell for the next item.<br>
The scrolling is smooth. No blank areas.<br>
The recyclingKey prop tells expo-image that the cell now shows a different photo.<br>
It clears the old image and loads the new one.<br>
FlashList plus expo-image plus mipmaps. That's the full picture.<br>
Let's compare all **4** methods.<br>

(라스트 파트: **스크롤링**.<br>
플랫리스트 크리에이츠 어 뉴 컴포넌트 포 에브리 셀.<br>
웬 어 셀 스크롤즈 어웨이, 잇츠 디스트로이드.<br>
위드 매니 포토즈, 디스 민즈 드랍트 **프레임즈** 앤드 블랭크 셀즈.<br>
플래시리스트 이즈 **디퍼런트**. 잇 웍스 라이크 유아이콜렉션뷰 온 아이오에스.<br>
웬 어 셀 스크롤즈 어웨이, 잇 리유지즈 댓 셀 포 더 넥스트 아이템.<br>
더 스크롤링 이즈 **스무드**. 노 블랭크 에리어즈.<br>
더 리사이클링키 프랍 텔즈 엑스포-이미지 댓 더 셀 나우 쇼즈 어 디퍼런트 포토.<br>
잇 클리어즈 디 올드 이미지 앤드 로즈 더 뉴 원.<br>
플래시리스트 플러스 엑스포-이미지 플러스 밉맵스. 댓츠 더 풀 **픽처**.<br>
렛츠 컴페어 올 **포** **메써즈**.)<br>

마지막: 스크롤링.<br>
FlatList는 모든 셀마다 새 컴포넌트를 만듭니다.<br>
셀이 스크롤 밖으로 나가면 파괴됩니다.<br>
사진이 많으면 프레임 드랍과 빈 셀이 생깁니다.<br>
FlashList는 다릅니다. iOS의 UICollectionView처럼 작동합니다.<br>
셀이 스크롤 밖으로 나가면 다음 아이템에 재사용합니다.<br>
스크롤이 매끄럽습니다.<br>
recyclingKey 프랍은 셀이 다른 사진을 보여줄 때 expo-image에 알려줍니다.<br>
FlashList + expo-image + 밉맵. 이것이 전체 그림입니다.<br>
**4**가지 방법을 비교해봅시다.<br>
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
These numbers are from my demo app.<br>
Tested on an iPhone simulator with **1,809** photos.<br>
RN Image: **311** megabytes. Almost **4** seconds to load.<br>
useImage: **4,848** megabytes. App crashes.<br>
expo-image: **182** megabytes. **85** milliseconds.<br>
Mipmaps plus expo-image: **174** megabytes. **57** milliseconds. The best result.<br>

(디즈 넘버즈 아 프롬 마이 데모 앱.<br>
테스티드 온 언 아이폰 **시뮬레이터** 위드 **에이틴헌드레드앤나인** 포토즈.<br>
아알엔 이미지: **쓰리헌드레드일레븐** 메가바이츠. 올모스트 **포** 세컨즈 투 로드.<br>
유즈이미지: **포타우전드에잇헌드레드포티에잇** 메가바이츠. 앱 크래시즈.<br>
엑스포-이미지: **원에이티투** 메가바이츠. **에이티파이브** 밀리세컨즈.<br>
밉맵스 플러스 엑스포-이미지: **원세븐티포** 메가바이츠. **피프티세븐** 밀리세컨즈. 더 베스트 리절트.)<br>

이 수치는 제 데모 앱에서 나온 것입니다.<br>
iPhone 시뮬레이터에서 **1,809**장으로 테스트했습니다.<br>
RN Image: **311**메가바이트. 로드에 거의 **4**초.<br>
useImage: **4,848**메가바이트. 앱 크래시.<br>
expo-image: **182**메가바이트. **85**밀리초.<br>
밉맵 + expo-image: **174**메가바이트. **57**밀리초. 최고 결과.<br>
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
Here is the summary.<br>
From RN Image to mipmaps: RAM went down **44%**. From **311** to **174** megabytes.<br>
Load time went down **98%**. From almost **4** seconds to **57** milliseconds.<br>
The biggest win was switching to expo-image.<br>
Mipmaps added a smaller gain on top. Plus, the second launch is instant.<br>

(히어 이즈 더 **서머리**.<br>
프롬 아알엔 이미지 투 밉맵스: 램 웬트 다운 **포티포** 퍼센트. 프롬 **쓰리헌드레드일레븐** 투 **원세븐티포** 메가바이츠.<br>
로드 타임 웬트 다운 **나인티에잇** 퍼센트. 프롬 올모스트 **포** 세컨즈 투 **피프티세븐** 밀리세컨즈.<br>
더 비기스트 윈 워즈 스위칭 투 엑스포-이미지.<br>
밉맵스 애디드 어 스몰러 게인 온 탑. 플러스, 더 세컨드 론치 이즈 **인스턴트**.)<br>

요약입니다.<br>
RN Image에서 밉맵까지: RAM이 **44%** 줄었습니다. **311**에서 **174**메가바이트로.<br>
로드 시간은 **98%** 줄었습니다. 거의 **4**초에서 **57**밀리초로.<br>
가장 큰 개선은 expo-image로 전환한 것입니다.<br>
밉맵은 그 위에 추가 개선을 더했습니다.<br>
그리고 두 번째 실행은 즉시 로드됩니다.<br>
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

**3. Pre-generate & cache thumbnails** — Skip PHImageManager, reuse across the app

</div>
<div class="card !py-2">

**4. Recycle, don't recreate** — FlashList + `recyclingKey` for smooth scrolling

</div>
<div class="card-bad !py-2">

**5. Beware of hooks in recycled views** — hook state never cleans up → crash

</div>
</div>

<!--
Let me finish with **5** lessons.<br>
One. Don't load what you don't show.<br>
Use batch loading with ph:// references. Keep memory low from the start.<br>
Two. The right image component is the most important choice.<br>
Pick one that handles asset URIs on the native side. Not through the JavaScript bridge.<br>
Three. Pre-generate and cache your thumbnails.<br>
Even though expo-image downscales for you, pre-made mipmaps skip PHImageManager entirely.<br>
They load faster, and you can reuse them across any screen in the app.<br>
Four. Recycle, don't recreate.<br>
FlashList gives smooth scrolling with no blank cells. Even with thousands of photos.<br>
Five. Be careful with hooks in recycled views.<br>
useImage manages images as hook state. FlashList recycles cells without unmounting them.<br>
So the hook never cleans up. Old references pile up and the app crashes.<br>

(렛 미 **피니시** 위드 **파이브** 레슨즈.<br>
원. 돈트 로드 왓 유 돈트 쇼.<br>
유즈 배치 로딩 위드 피에이치 레퍼런시즈. 킵 메모리 로우 프롬 더 스타트.<br>
투. 더 라이트 이미지 컴포넌트 이즈 더 모스트 임포턴트 **초이스**.<br>
픽 원 댓 핸들즈 에셋 유아아이즈 온 더 네이티브 사이드. 낫 쓰루 더 자바스크립트 **브릿지**.<br>
쓰리. 프리-**제너레이트** 앤드 캐시 유어 썸네일즈.<br>
이븐 도우 엑스포-이미지 다운스케일즈 포 유, 프리-메이드 밉맵스 스킵 피에이치이미지매니저 인**타이얼리**.<br>
데이 로드 패스터, 앤드 유 캔 리유즈 뎀 어크로스 에니 스크린 인 디 앱.<br>
포. **리사이클**, 돈트 리크리에이트.<br>
플래시리스트 기브즈 스무드 스크롤링 위드 노 블랭크 셀즈. 이븐 위드 타우전즈 오브 포토즈.<br>
파이브. 비 **케어풀** 위드 훅스 인 리사이클드 뷰즈.<br>
유즈이미지 매니지즈 이미지즈 애즈 훅 스테이트. 플래시리스트 리사이클즈 셀즈 위다웃 **언마운팅** 뎀.<br>
쏘 더 훅 네버 클린즈 업. 올드 레퍼런시즈 파일 업 앤드 디 앱 크래시즈.)<br>

**5**가지 교훈으로 마무리합니다.<br>
하나. 보여주지 않는 것은 로드하지 마세요.<br>
ph:// 참조로 배치 로딩. 처음부터 메모리를 낮게 유지하세요.<br>
둘. 올바른 이미지 컴포넌트 선택이 가장 중요합니다.<br>
에셋 URI를 네이티브에서 처리하는 것을 선택하세요.<br>
셋. 썸네일을 미리 생성하고 캐시하세요.<br>
expo-image가 다운스케일해주지만, 미리 만든 밉맵은 PHImageManager를 완전히 건너뜁니다.<br>
더 빠르게 로드되고, 앱 어디서든 재사용할 수 있습니다.<br>
넷. 재생성 말고 재활용.<br>
FlashList는 빈 셀 없이 매끄러운 스크롤을 제공합니다.<br>
다섯. 재활용되는 뷰에서 훅 사용에 주의하세요.<br>
useImage는 훅 상태로 이미지를 관리합니다. FlashList는 셀을 언마운트하지 않고 재활용합니다.<br>
훅이 정리되지 않습니다. 이전 참조가 쌓이고 앱이 크래시됩니다.<br>
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

Blog: **miryang.dev** · LinkedIn: **MiryangJung**

</div>

</div>

<!--
Thank you!<br>
Unfortunately, we don't have time for questions on stage.<br>
But please send me a message on LinkedIn. I'd love to chat!<br>
Thank you!<br>

(땡큐!<br>
언포추너틀리, 위 돈트 해브 타임 포 퀘스천즈 온 스테이지.<br>
벗 플리즈 센드 미 어 메시지 온 **링크드인**. 아이드 러브 투 챗!<br>
땡큐!)<br>

감사합니다!<br>
아쉽게도 무대에서 질문 시간이 없습니다.<br>
링크드인으로 메시지 보내주세요.<br>
편하게 대화하고 싶습니다!<br>
감사합니다!<br>
-->
