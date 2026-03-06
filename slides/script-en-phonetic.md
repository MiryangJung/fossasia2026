# Speaker Script (English + Korean Phonetic Guide)

발음 가이드: 영문 스크립트 + 어려운 단어 한글 발음 병기
강세는 **굵게** 표시

---

## Slide 1: Title + Self-intro (40s)

Hello everyone, I'm Miryang Jung. I'm a Senior Frontend Engineer at Grandeclip.
(헬로우 에브리원, 아임 미량 정. 아임 어 **시니어** 프론트엔드 엔지니어 앳 그랑드클립.)

I'm so happy to be here in Thailand, the land of Muay Thai. I actually bought so much boxing gear at Twins while I'm here - I've been boxing for about a year now, so this trip has been extra special.
(아임 쏘 해피 투 비 히어 인 **타일랜드**, 더 랜드 오브 무에타이. 아이 **액츄얼리** 봇 쏘 머치 복싱 기어 앳 트윈스 와일 아임 히어 - 아이브 빈 복싱 포 어바웃 어 이어 나우, 쏘 디스 트립 해즈 빈 엑스트라 **스페셜**.)

Today I'll share how we reduced memory usage from over 2GB down to under 200MB when rendering large image lists in React Native. I built a demo app to reproduce each optimization step and measured the results on a real device. The numbers you'll see are from that demo - your exact results may vary depending on device, OS version, and photo library, but the relative improvements should be consistent.
(투데이 아일 셰어 하우 위 **리듀스드** 메모리 유시지 프롬 오버 투 기가바이츠 다운 투 언더 투헌드레드 메가바이츠 웬 **렌더링** 라지 이미지 리스츠 인 리액트 네이티브. 아이 빌트 어 데모 앱 투 리프로**듀스** 이치 옵티마이**제이션** 스텝 앤드 **메저드** 더 리절츠 온 어 리얼 디바이스. 더 넘버즈 율 씨 아 프롬 댓 데모 - 유어 이**잭트** 리절츠 메이 **베어리** 디펜딩 온 디바이스, 오에스 버전, 앤드 포토 라이브러리, 벗 더 **렐러티브** 임프루브먼츠 슈드 비 컨**시스턴트**.)

---

## Slide 2: Why Build an In-App Photo Picker? (40s)

So why did we need to build our own photo picker?
(쏘 와이 디드 위 니드 투 빌드 아워 오운 포토 **피커**?)

If you've used the default system picker on iOS or Android, you know it works fine for basic use cases. But it has real limitations.
(이프 유브 유즈드 더 디폴트 시스템 피커 온 아이오에스 오어 **안드로이드**, 유 노우 잇 웍스 파인 포 **베이직** 유스 케이시즈. 벗 잇 해즈 리얼 리미**테이션즈**.)

We needed album-specific image lists, masonry layouts, variable grid columns - things you simply can't do with the system picker.
(위 니디드 앨범-스퍼**시픽** 이미지 리스츠, **메이슨리** 레이아웃츠, **베리어블** 그리드 컬럼즈 - 띵즈 유 심플리 캔트 두 위드 더 시스템 피커.)

We also needed multi-select with a custom UI and full control over the selection experience.
(위 올소 니디드 멀티-셀렉트 위드 어 커스텀 유아이 앤드 풀 컨트롤 오버 더 셀렉션 익스**피리언스**.)

So we decided to build our own in-app gallery. And that's when the problems started.
(쏘 위 디**사이디드** 투 빌드 아워 오운 인앱 갤러리. 앤드 댓츠 웬 더 프라블럼즈 **스타티드**.)

---

## Slide 3: The Problem (50s)

Here's the simplest possible implementation. Take a FlatList, feed it 1,809 photos from the device library, and render each one with a basic React Native Image component.
(히어즈 더 **심플리스트** 파서블 임플리멘**테이션**. 테이크 어 플랫리스트, 피드 잇 에이틴-헌드레드-앤-나인 포토즈 프롬 더 디바이스 **라이브러리**, 앤드 렌더 이치 원 위드 어 베이직 리액트 네이티브 이미지 **컴포넌트**.)

What happens? Memory spikes dramatically and the app crashes.
(왓 해픈즈? **메모리** 스파이크스 드라**매티컬리** 앤드 디 앱 **크래시즈**.)

Why? Because every single cell is loading the full-resolution original image. We're talking 12-megapixel photos - 4032 by 3024 pixels each - being decoded for a tiny 96 by 96 point thumbnail.
(와이? 비코즈 에브리 싱글 셀 이즈 로딩 더 풀-**레절루션** 오리지널 이미지. 위어 토킹 트웰브-**메가픽셀** 포토즈 - 포티-써티투 바이 써티-트웬티포 픽셀즈 이치 - 비잉 디**코디드** 포 어 타이니 나인티식스 바이 나인티식스 포인트 **썸네일**.)

There's no view recycling, so every cell that scrolls into view creates a brand new Image instance. And there's no caching, so scrolling back up loads everything again from scratch.
(데어즈 노 뷰 **리사이클링**, 쏘 에브리 셀 댓 스크롤즈 인투 뷰 크리에이츠 어 브랜드 뉴 이미지 **인스턴스**. 앤드 데어즈 노 **캐싱**, 쏘 스크롤링 백 업 로즈 에브리띵 어겐 프롬 **스크래치**.)

This is obviously not going to work. So how do we fix it?
(디스 이즈 **아브비어슬리** 낫 고잉 투 워크. 쏘 하우 두 위 **픽스** 잇?)

---

## Slide 4: How Other Gallery Apps Solve This (40s)

Before jumping into code, let's think about how other gallery apps handle this. Apps like Google Photos or Samsung Gallery display thousands of photos smoothly. What's their strategy?
(비포 점핑 인투 코드, 렛츠 띵크 어바웃 하우 아더 갤러리 앱스 핸들 디스. 앱스 라이크 구글 포토즈 오어 삼성 갤러리 디스플레이 **타우전즈** 오브 포토즈 **스무들리**. 왓츠 데어 **스트래터지**?)

First, they index metadata first and load actual image data only on demand.
(퍼스트, 데이 **인덱스** 메타데이터 퍼스트 앤드 로드 액츄얼 이미지 데이터 온리 온 디**맨드**.)

Second, they use pre-generated low-resolution thumbnails sized exactly to the display grid.
(세컨드, 데이 유즈 프리-**제너레이티드** 로우-레절루션 썸네일즈 사이즈드 이**잭틀리** 투 더 디스플레이 그리드.)

Third, they recycle views - when a cell scrolls off screen, it gets reused for a new photo rather than destroyed.
(써드, 데이 **리사이클** 뷰즈 - 웬 어 셀 스크롤즈 오프 스크린, 잇 겟츠 리**유즈드** 포 어 뉴 포토 래더 댄 디**스트로이드**.)

And fourth, they use progressive loading - show a placeholder, then a thumbnail, then the full image only when needed.
(앤드 포쓰, 데이 유즈 프로**그레시브** 로딩 - 쇼우 어 **플레이스홀더**, 덴 어 썸네일, 덴 더 풀 이미지 온리 웬 니디드.)

We're going to apply these same principles in React Native.
(위어 고잉 투 어**플라이** 디즈 세임 **프린서플즈** 인 리액트 네이티브.)

---

## Slide 5: Batch Loading & Caching (50s)

First, loading.
(퍼스트, **로딩**.)

Instead of loading all 1,809 photos at once, we use expo-media-library to load just 50 at a time.
(인스테드 오브 로딩 올 에이틴헌드레드앤나인 포토즈 앳 원스, 위 유즈 엑스포-미디어-라이브러리 투 로드 저스트 **피프티** 앳 어 타임.)

The key insight here is that the ph-URI you get back is just an asset reference - an identifier for a photo in the iOS Photos library. It doesn't contain any pixel data. No memory is consumed until you actually try to render it.
(더 키 **인사이트** 히어 이즈 댓 더 피에이치-유아아이 유 겟 백 이즈 저스트 어 메타데이터 **레퍼런스**. 잇 더전트 컨테인 에니 **픽셀** 데이터. 잇츠 베이시컬리 언 아이디 댓 세즈 "디스 포토 이**그지스츠** 온 디스크." 노 메모리 이즈 컨**슘드** 언틸 유 액츄얼리 트라이 투 렌더 잇.)

We paginate using the endCursor from each batch, which gives us infinite scroll naturally. As the user scrolls down, we fetch the next 50 photos.
(위 **패지네이트** 유징 디 엔드커서 프롬 이치 배치, 위치 기브즈 어스 **인피닛** 스크롤 내츄럴리.)

This is our foundation - lightweight asset references instead of heavy pixel data.
(디스 이즈 아워 파운**데이션** - 라이트웨이트 에셋 레퍼런시즈 인스테드 오브 헤비 픽셀 데이터.)

Now we have these references, but how do we actually render them on screen?
(나우 위 해브 디즈 레퍼런시즈, 벗 하우 두 위 **액츄얼리** 렌더 뎀 온 스크린?)

---

## Slide 6: Rendering - RN Image + FlashList (50s)

Now, rendering. The first thing I tried was the built-in React Native Image component.
(나우, **렌더링**. 더 퍼스트 띵 아이 트라이드 워즈 더 빌트인 리액트 네이티브 이미지 컴포넌트.)

The problem is that RN Image can't handle ph-URIs directly on iOS. You first need to call getAssetInfoAsync to resolve it to a file-URI. That's an async call for every single cell.
(더 프라블럼 이즈 댓 아알엔 이미지 캔트 핸들 피에이치-유아아이즈 디**렉틀리** 온 아이오에스. 유 퍼스트 니드 투 콜 겟에셋인포어싱크 투 리**졸브** 잇 투 어 파일-유아아이. 댓츠 언 어**싱크** 콜 포 에브리 싱글 셀.)

As you can see in this demo, it takes an average of 3,796 milliseconds to load all images. That's almost 4 seconds of staring at blank cells.
(애즈 유 캔 씨 인 디스 데모, 잇 테이크스 언 **애버리지** 오브 써티세븐-헌드레드-나인티식스 **밀리세컨즈** 투 로드 올 이미지즈. 댓츠 올모스트 포 **세컨즈** 오브 스테어링 앳 블랭크 셀즈.)

RAM usage is 311 megabytes, which is manageable but not great. And notice the scrolling - it's janky because every cell triggers a fresh async resolution.
(램 유시지 이즈 쓰리헌드레드일레븐 메가바이츠, 위치 이즈 **매니저블** 벗 낫 그레이트. 앤드 노티스 더 스크롤링 - 잇츠 **쟁키** 비코즈 에브리 셀 트리거즈 어 프레시 어**싱크** 레졸루션.)

Almost 4 seconds of blank cells is unacceptable. There must be a better image component.
(올모스트 포 세컨즈 오브 블랭크 셀즈 이즈 언억**셉터블**. 데어 머스트 비 어 **베터** 이미지 컴포넌트.)

---

## Slide 7: Rendering - useImage Trap (60s)

Still on rendering. So I went looking for alternatives and found an Expo GitHub issue that recommended using the useImage hook from expo-image. It seemed like a clean, modern approach.
(**스틸** 온 렌더링. 쏘 아이 웬트 루킹 포 올터**너티브즈** 앤드 파운드 언 엑스포 깃헙 이슈 댓 레커**멘디드** 유징 더 유즈이미지 훅 프롬 엑스포-이미지. 잇 심드 라이크 어 클린, **모던** 어프로치.)

But when I combined useImage with FlashList, something terrible happened. RAM shot up to 4,848 megabytes - nearly 5 gigs - and the app crashed almost immediately on scroll.
(벗 웬 아이 컴**바인드** 유즈이미지 위드 플래시리스트, 썸띵 **테러블** 해픈드. 램 샷 업 투 포타우전드-에잇헌드레드-포티에잇 메가바이츠 - 니얼리 파이브 **기그즈** - 앤드 디 앱 크래시드 올모스트 이미**디엇틀리** 온 스크롤.)

What's going on? useImage loads full-resolution images and keeps them in memory. But FlashList reuses cells instead of destroying them. So old images never get cleaned up - they just pile up.
(왓츠 고잉 온? 유즈이미지 로즈 풀-**레졸루션** 이미지즈 앤드 킵스 뎀 인 **메모리**. 벗 플래시리스트 리**유지즈** 셀즈 인스테드 오브 디**스트로잉** 뎀. 쏘 올드 이미지즈 네버 겟 클린드 업 - 데이 저스트 **파일** 업.)

With fast scrolling, these images accumulate faster than they're released. It's essentially a memory leak.
(위드 패스트 스크롤링, 디즈 이미지즈 어**큐뮬레이트** 패스터 댄 데이어 릴리스드. 잇츠 이**센셜리** 어 메모리 **리크**.)

The lesson here: be very careful using hooks in recycled views.
(더 레슨 히어: 비 베리 **케어풀** 유징 훅스 인 리사이클드 뷰즈.)

So we need a component that handles ph-URIs natively, without this problem.
(쏘 위 니드 어 컴포넌트 댓 **핸들즈** 피에이치-유아아이즈 네이티블리, 위다웃 디스 프라블럼.)

---

## Slide 8: Rendering - expo-image + FlashList (40s)

The solution is straightforward - use the expo-image component directly, not through a hook.
(더 솔루션 이즈 스트레이트**포워드** - 유즈 디 엑스포-이미지 컴포넌트 디렉틀리, 낫 쓰루 어 훅.)

expo-image resolves ph-URIs natively on the platform side, so there's no JavaScript overhead. It has built-in support for view recycling through the recyclingKey prop. When a cell is reused for a different photo, recyclingKey tells expo-image to clear the old image and load the new one correctly.
(엑스포-이미지 리졸브즈 피에이치-유아아이즈 **네이티블리** 온 더 플랫폼 사이드, 쏘 데어즈 노 자바스크립트 **오버헤드**. 잇 해즈 빌트인 서포트 포 뷰 리사이클링 쓰루 더 리사이클링키 프랍. 웬 어 셀 이즈 리유즈드, 리사이클링키 텔즈 엑스포-이미지 투 **클리어** 디 올드 이미지 앤드 로드 더 뉴 원 커**렉틀리**.)

The results are dramatic. Average load time drops to 85 milliseconds - that's 45 times faster than RN Image. RAM stays stable at 182 megabytes.
(더 리절츠 아 드라**매틱**. 애버리지 로드 타임 드랍스 투 에이티파이브 밀리세컨즈 - 댓츠 **포티파이브** 타임즈 패스터 댄 아알엔 이미지. 램 스테이즈 **스테이블** 앳 원에이티투 메가바이츠.)

But we're still decoding full 12-megapixel photos for tiny thumbnail cells. Can we reduce what we actually decode?
(벗 위아 스틸 디코딩 풀 트웰브-**메가픽셀** 포토즈 포 타이니 썸네일 셀즈. 캔 위 리**듀스** 왓 위 액츄얼리 디코드?)

---

## Slide 9: Decoding - Mipmaps Concept (50s)

Now, decoding. This is where mipmaps come in.
(나우, **디코딩**. 디스 이즈 웨어 **밉맵스** 컴 인.)

Think about what's happening. Our original photos are 4032 by 3024 pixels - 12 megapixels each. But the grid cell on screen is only about 98 by 98 points. Even accounting for a 3x retina display, that's just 294 by 294 pixels.
(띵크 어바웃 왓츠 해프닝. 아워 오리지널 포토즈 아 포티써티투 바이 써티트웬티포 픽셀즈 - 트웰브 메가픽셀즈 이치. 벗 더 그리드 셀 온 스크린 이즈 온리 어바웃 나인티에잇 바이 나인티에잇 **포인츠**. 이븐 어카운팅 포 어 쓰리엑스 **레티나** 디스플레이, 댓츠 저스트 투헌드레드나인티포 바이 투헌드레드나인티포 픽셀즈.)

We're decoding 12 million pixels when we only need about 86 thousand. That's roughly 170 times more data than necessary.
(위어 디코딩 트웰브 **밀리언** 픽셀즈 웬 위 온리 니드 어바웃 에이티식스 **타우전드**. 댓츠 러플리 원헌드레드세븐티 타임즈 모어 데이터 댄 **네서세리**.)

The idea is simple - instead of decoding the full photo every time, we pre-generate a small JPEG thumbnail at exactly the size we need and reuse it forever. This is called mipmapping.
(디 아이**디어** 이즈 **심플** - 인스테드 오브 디코딩 더 풀 포토 에브리 타임, 위 프리-**제너레이트** 어 스몰 제이펙 썸네일 앳 이**잭틀리** 더 사이즈 위 니드 앤드 리유즈 잇 포**에버**. 디스 이즈 콜드 **밉매핑**.)

---

## Slide 10: Decoding - Mipmap Implementation (60s)

Here's how we implement mipmaps step by step.
(히어즈 하우 위 임플리먼트 밉맵스 스텝 바이 스텝.)

First, size calculation. We divide the screen width by 4 - because our grid has 4 columns - to get the layout width of each cell. Then we call PixelRatio.getPixelSizeForLayoutSize to convert logical points to physical pixels. On a 3x retina iPhone, a 98-point cell becomes 294 physical pixels. This is the key - we're generating thumbnails at exactly the resolution the screen can actually display. Not bigger, not smaller.
(퍼스트, 사이즈 캘큘**레이션**. 위 디바이드 더 스크린 위드쓰 바이 포 - 비코즈 아워 그리드 해즈 포 컬럼즈 - 투 겟 더 레이아웃 위드쓰 오브 이치 셀. 덴 위 콜 픽셀레이쇼.겟픽셀사이즈포레이아웃사이즈 투 컨버트 **라지컬** 포인츠 투 **피지컬** 픽셀즈. 온 어 쓰리엑스 레티나 아이폰, 어 나인티에잇-포인트 셀 비컴즈 투헌드레드나인티포 피지컬 픽셀즈. 디스 이즈 더 **키**.)

The cache key includes the mipmap width, so if the grid layout ever changes - say from 4 columns to 3 - the key changes automatically and new mipmaps are generated at the correct size.
(더 캐시 키 인**클루즈** 더 밉맵 위드쓰, 쏘 이프 더 그리드 레이아웃 에버 체인지즈 - 세이 프롬 포 컬럼즈 투 쓰리 - 더 키 체인지즈 오토**매티컬리**.)

For generation, we use expo-image-manipulator. We call manipulate, resize to the target width, render, then save as a compressed JPEG at 90% quality. The result is a tiny file - roughly 20 to 30 kilobytes instead of several megabytes.
(포 제너**레이션**, 위 유즈 엑스포-이미지-머**니풀레이터**. 위 콜 머니풀레이트, 리사이즈 투 더 타겟 위드쓰, 렌더, 덴 세이브 애즈 어 컴프레스드 제이펙 앳 나인티 퍼센트 **퀄리티**. 더 리절트 이즈 어 타이니 파일 - 러플리 트웬티 투 써티 **킬로바이츠** 인스테드 오브 세버럴 메가바이츠.)

Each mipmap is saved to the app's document directory and indexed with MMKV. We process 10 photos at a time using Promise.all, and always check the cache first.
(이치 밉맵 이즈 세이브드 투 디 앱스 다큐먼트 디**렉토리** 앤드 인덱스드 위드 엠엠케이브이. 위 프라세스 텐 포토즈 앳 어 타임 유징 프라미스.올, 앤드 올웨이즈 체크 더 **캐시** 퍼스트.)

So the first launch takes a few seconds to generate all thumbnails, but every subsequent launch loads them instantly from cache.
(쏘 더 퍼스트 **론치** 테이크스 어 퓨 세컨즈 투 제너레이트 올 썸네일즈, 벗 에브리 **섭시퀀트** 론치 로즈 뎀 인**스턴틀리** 프롬 캐시.)

---

## Slide 11: Decoding - Mipmaps Result (30s)

Here are the results. RAM drops to 174 megabytes - 4% less than expo-image alone. Average load time is 57 milliseconds, 33% faster.
(히어 아 더 리절츠. 램 드랍스 투 원세븐티포 메가바이츠 - 포 퍼센트 레스 댄 엑스포-이미지 얼**론**. 애버리지 로드 타임 이즈 피프티세븐 밀리세컨즈, 써티쓰리 퍼센트 **패스터**.)

But the real win is on relaunch. Since mipmaps are persisted on disk and indexed with MMKV, the gallery loads almost instantly the second time you open it.
(벗 더 리얼 **윈** 이즈 온 리**론치**. 신스 밉맵스 아 퍼**시스티드** 온 디스크 앤드 인덱스드 위드 엠엠케이브이, 더 갤러리 로즈 올모스트 인스턴틀리 더 세컨드 타임 유 오픈 잇.)

The final piece that ties this all together is the list component itself.
(더 **파이널** 피스 댓 타이즈 디스 올 투게더 이즈 더 리스트 컴포넌트 잇**셀프**.)

---

## Slide 12: Scrolling - FlashList (40s)

Finally, scrolling. Let me explain why FlashList is essential in this pipeline.
(**파이널리**, 스크롤링. 렛 미 익스**플레인** 와이 플래시리스트 이즈 이**센셜** 인 디스 파이프라인.)

FlatList mounts a new component instance for every cell that scrolls into view. When it scrolls off, that instance is destroyed. With large photo libraries, this means frame drops and blank white cells during fast scrolling.
(플랫리스트 마운츠 어 뉴 컴포넌트 인스턴스 포 에브리 셀 댓 스크롤즈 인투 뷰. 웬 잇 스크롤즈 오프, 댓 인스턴스 이즈 디**스트로이드**. 위드 라지 포토 라이브러리즈, 디스 민즈 **프레임 드랍스** 앤드 블랭크 와이트 셀즈 듀링 패스트 스크롤링.)

FlashList works like a native UICollectionView on iOS. When a cell scrolls off screen, it reuses that same component for a new item. The result is buttery smooth scrolling with no blank areas. The recyclingKey prop tells expo-image that a cell now represents a different photo, so it clears the old image and loads the new one correctly.
(플래시리스트 웍스 라이크 어 네이티브 유아이콜렉션뷰 온 아이오에스. 웬 어 셀 스크롤즈 오프 스크린, 잇 리**유지즈** 댓 세임 컴포넌트 포 어 뉴 아이템. 더 리절트 이즈 **버터리** 스무드 스크롤링 위드 노 블랭크 에리어즈. 더 리사이클링키 프랍 텔즈 엑스포-이미지 댓 어 셀 나우 레프리**젠츠** 어 디퍼런트 포토, 쏘 잇 **클리어즈** 디 올드 이미지 앤드 로즈 더 뉴 원 커렉틀리.)

The combination of FlashList's recycling, expo-image's native rendering, and mipmap thumbnails is what makes this whole pipeline work together.
(더 컴비**네이션** 오브 플래시리스츠 리사이클링, 엑스포-이미지즈 네이티브 렌더링, 앤드 밉맵 썸네일즈 이즈 왓 메이크스 디스 홀 파이프라인 워크 투**게더**.)

Now let's see how all four approaches compare side by side.
(나우 렛츠 씨 하우 올 포 어프로치즈 컴**페어** 사이드 바이 사이드.)

---

## Slide 13: Results (30s)

These numbers are from a demo app I built to reproduce each step, tested on an iPhone with 1,809 photos.
(디즈 넘버즈 아 프롬 어 데모 앱 아이 빌트 투 리프로듀스 이치 스텝, 테스티드 온 언 아이폰 위드 에이틴헌드레드앤나인 포토즈.)

RN Image: 311 megabytes RAM, nearly 4-second load time.
useImage: 4,848 megabytes - nearly 5 gigs - crashes immediately.
expo-image: 182 megabytes and 85 milliseconds. A huge improvement.
Mipmaps with expo-image: 174 megabytes and 57 milliseconds. Our final, most optimized result.

---

## Slide 14: Results Summary (30s)

Here's the summary. From the naive RN Image approach to our final mipmap solution: RAM decreased 44%, from 311 down to 174 megabytes. Load time decreased 98%, from nearly 4 seconds down to 57 milliseconds.
(히어즈 더 **서머리**. 프롬 더 나이브 아알엔 이미지 어프로치 투 아워 파이널 밉맵 솔루션: 램 디**크리스드** 포티포 퍼센트. 로드 타임 디크리스드 나인티에잇 퍼센트.)

The biggest single improvement came from switching to expo-image. Mipmaps added the final incremental gain on top, plus the huge benefit of instant relaunch.
(더 비기스트 싱글 임**프루브먼트** 케임 프롬 스위칭 투 엑스포-이미지. 밉맵스 애디드 더 파이널 인크리**멘탈** 게인 온 탑, 플러스 더 휴지 **베네핏** 오브 인스턴트 리론치.)

---

## Slide 15: Lessons Learned (50s)

Let me wrap up with five lessons.
(렛 미 랩 업 위드 파이브 **레슨즈**.)

First, don't load what you don't display. Batch loading with ph-asset references keeps your initial memory footprint near zero.
(퍼스트, 돈트 로드 왓 유 돈트 디스플레이.)

Second, the right image component matters more than anything else. Choose one that resolves asset URIs natively, not through the JavaScript bridge.
(세컨드, 더 라이트 이미지 컴포넌트 **매터즈** 모어 댄 에니띵 엘스. 추즈 원 댓 리**졸브즈** 에셋 유아아이즈 **네이티블리**, 낫 쓰루 더 자바스크립트 **브릿지**.)

Third, match your pixel budget to your display size. Calculate your actual pixel needs with PixelRatio, generate mipmaps at that exact size, and cache them permanently.
(써드, 매치 유어 픽셀 **버짓** 투 유어 디스플레이 사이즈.)

Fourth, recycle, don't recreate. FlashList gives you smooth scrolling with no frame drops and no blank cells, even with thousands of photos.
(포쓰, **리사이클**, 돈트 리크리에이트. 플래시리스트 기브즈 유 스무드 스크롤링 위드 노 프레임 드랍스 앤드 노 블랭크 셀즈.)

And fifth - beware of hooks in recycled views. useImage keeps loaded images in memory, and since FlashList reuses cells instead of destroying them, old images pile up until the app crashes.
(앤드 피프쓰 - 비**웨어** 오브 훅스 인 리사이클드 뷰즈. 유즈이미지 킵스 로디드 이미지즈 인 메모리, 앤드 신스 플래시리스트 리유지즈 셀즈 인스테드 오브 디스트로잉 뎀, 올드 이미지즈 **파일** 업 언틸 디 앱 **크래시즈**.)

---

## Slide 16: Thank You (20s)

Thank you so much! Unfortunately we're out of time for questions on stage, but please come find me afterwards - I'd love to chat about React Native performance or anything else. Thank you!
(땡큐 쏘 머치! 언**포춘잇틀리** 위어 아웃 오브 타임 포 퀘스천즈 온 스테이지, 벗 플리즈 컴 파인드 미 **애프터워즈** - 아이드 러브 투 챗 어바웃 리액트 네이티브 퍼**포먼스** 오어 에니띵 엘스. 땡큐!)
