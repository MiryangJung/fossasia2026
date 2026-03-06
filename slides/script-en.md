# Speaker Script (English Only)

Target: ~10 minutes (~1,300 words at 130 WPM)

---

## Slide 1: Title + Self-intro (40s)

Hello everyone, I'm Miryang Jung. I'm a Senior Frontend Engineer at Grandeclip.
I'm so happy to be here in Thailand, the land of Muay Thai. I actually bought so much boxing gear at Twins while I'm here - I've been boxing for about a year now, so this trip has been extra special.
Today I'll share how we reduced memory usage from over 2GB down to under 200MB when rendering large image lists in React Native. I built a demo app to reproduce each optimization step and measured the results on a real device. The numbers you'll see are from that demo - your exact results may vary depending on device, OS version, and photo library, but the relative improvements should be consistent.

---

## Slide 2: Why Build an In-App Photo Picker? (40s)

So why did we need to build our own photo picker?
If you've used the default system picker on iOS or Android, you know it works fine for basic use cases. But it has real limitations.
We needed album-specific image lists, masonry layouts, variable grid columns - things you simply can't do with the system picker.
We also needed multi-select with a custom UI and full control over the selection experience.
So we decided to build our own in-app gallery. And that's when the problems started.

---

## Slide 3: The Problem (50s)

Here's the simplest possible implementation. Take a FlatList, feed it 1,809 photos from the device library, and render each one with a basic React Native Image component.
What happens? Memory spikes dramatically and the app crashes.
Why? Because every single cell is loading the full-resolution original image. We're talking 12-megapixel photos - 4032 by 3024 pixels each - being decoded for a tiny 96 by 96 point thumbnail. Each decoded photo takes roughly 48 megabytes of raw bitmap data in memory.
There's no view recycling, so every cell that scrolls into view creates a brand new Image instance. And there's no caching, so scrolling back up loads everything again from scratch.
This is obviously not going to work. So how do we fix it?

---

## Slide 4: How Other Gallery Apps Solve This (40s)

Before jumping into code, let's think about how other gallery apps handle this. Apps like Google Photos or Samsung Gallery display thousands of photos smoothly. What's their strategy?
First, they index metadata first and load actual image data only on demand.
Second, they use pre-generated low-resolution thumbnails sized exactly to the display grid.
Third, they recycle views - when a cell scrolls off screen, it gets reused for a new photo rather than destroyed.
And fourth, they use progressive loading - show a placeholder, then a thumbnail, then the full image only when needed.
We're going to apply these same principles in React Native.

---

## Slide 5: Batch Loading & Caching (50s)

First, loading. Instead of loading all 1,809 photos at once, we use expo-media-library to load just 50 at a time.
The key insight here is that the ph-URI you get back is just an asset reference - an identifier for a photo in the iOS Photos library. It doesn't contain any pixel data. No memory is consumed until you actually try to render it.
We paginate using the endCursor from each batch, which gives us infinite scroll naturally. As the user scrolls down, we fetch the next 50 photos.
This is our foundation - lightweight asset references instead of heavy pixel data.
Now we have these references, but how do we actually render them on screen?

---

## Slide 6: Rendering - RN Image + FlashList (50s)

Now, rendering. The first thing I tried was the built-in React Native Image component.
The problem is that RN Image can't handle ph-URIs directly on iOS. You first need to call getAssetInfoAsync to resolve it to a file-URI - the actual path to the image file on disk. That's an async call for every single cell.
As you can see in this demo, it takes an average of 3,796 milliseconds to load all images. That's almost 4 seconds of staring at blank cells.
RAM usage is 311 megabytes, which is manageable but not great. And notice the scrolling - it's janky because every cell that appears triggers a fresh async resolution.
Almost 4 seconds of blank cells is unacceptable. There must be a better image component.

---

## Slide 7: Rendering - useImage Trap (60s)

Still on rendering. So I went looking for alternatives and found an Expo GitHub issue that recommended using the useImage hook from expo-image. It seemed like a clean, modern approach.
But when I combined useImage with FlashList, something terrible happened. RAM shot up to 4,848 megabytes - nearly 5 gigs - and the app crashed almost immediately on scroll.
What's going on? useImage loads full-resolution images and keeps them in memory. But FlashList reuses cells instead of destroying them. So old images never get cleaned up - they just pile up. With fast scrolling, images accumulate faster than they're released. It's essentially a memory leak.
The lesson here: be very careful using hooks in recycled views.
So we need a component that handles ph-URIs natively, without this problem.

---

## Slide 8: Rendering - expo-image + FlashList (40s)

The solution is straightforward - use the expo-image component directly, not through a hook.
expo-image resolves ph-URIs natively on the platform side - no async JavaScript calls needed. It handles everything in native code, so there's no bridge overhead.
It has built-in support for view recycling through the recyclingKey prop. When a cell is reused for a different photo, recyclingKey tells expo-image to clear the old image and load the new one correctly.
The results are dramatic. Average load time drops to 85 milliseconds - that's 45 times faster than RN Image. RAM stays stable at 182 megabytes. And the scrolling is silky smooth.
But we're still decoding full 12-megapixel photos for tiny thumbnail cells. Can we reduce what we actually decode?

---

## Slide 9: Decoding - Mipmaps Concept (50s)

Now, decoding. This is where mipmaps come in.
Think about what's happening. Our original photos are 4032 by 3024 pixels - 12 megapixels each. But the grid cell on screen is only about 98 by 98 points. Even accounting for a 3x retina display, that's just 294 by 294 pixels.
We're decoding 12 million pixels when we only need about 86 thousand. That's roughly 170 times more data than necessary. All that extra resolution is wasted - the image gets downscaled for display anyway, but only after the full photo has been decoded into memory.
The idea is simple - instead of decoding the full 12-megapixel photo every time, we pre-generate a small JPEG thumbnail at exactly the size we need and reuse it forever. This technique is called mipmapping.

---

## Slide 10: Decoding - Mipmap Implementation (60s)

Here's how we implement mipmaps step by step.
First, size calculation. We divide the screen width by 4 - because our grid has 4 columns - to get the layout width of each cell. Then we call PixelRatio.getPixelSizeForLayoutSize to convert logical points to physical pixels. On a 3x retina iPhone, a 98-point cell becomes 294 physical pixels. This is the key - we're generating thumbnails at exactly the resolution the screen can actually display. Not bigger, not smaller.
The cache key includes the mipmap width, so if the grid layout ever changes - say from 4 columns to 3 - the key changes automatically and new mipmaps are generated at the correct size.
For generation, we use expo-image-manipulator. We call manipulate, resize to the target width, render, then save as a compressed JPEG at 90% quality. The result is a tiny file - roughly 20 to 30 kilobytes instead of several megabytes.
Each mipmap is saved to the app's document directory and indexed with MMKV - a high-performance key-value store. We process 10 photos at a time using Promise.all, and always check the cache first. If the MMKV entry exists and the file is still on disk, we skip generation entirely.
So the first launch takes a few seconds to generate all thumbnails, but every subsequent launch loads them instantly from cache.

---

## Slide 11: Decoding - Mipmaps Result (30s)

Here are the results. RAM drops to 174 megabytes - 4% less than expo-image alone. Average load time is 57 milliseconds, 33% faster.
But the real win is on relaunch. Since mipmaps are persisted on disk and indexed with MMKV, the gallery loads almost instantly the second time you open it. No regeneration, no async resolution - just fast file reads from local storage.
The final piece that ties this all together is the list component itself.

---

## Slide 12: Scrolling - FlashList (40s)

Finally, scrolling. Let me explain why FlashList is essential in this pipeline.
FlatList mounts a new component instance for every cell that scrolls into view. When it scrolls off, that instance is destroyed. With large photo libraries, this means frame drops and blank white cells during fast scrolling.
FlashList works like a native UICollectionView on iOS. When a cell scrolls off screen, it reuses that same component for a new item. The result is buttery smooth scrolling with no blank areas. The recyclingKey prop tells expo-image that a cell now represents a different photo, so it clears the old image and loads the new one correctly.
The combination of FlashList's recycling, expo-image's native rendering, and mipmap thumbnails is what makes this whole pipeline work together.
Now let's see how all four approaches compare side by side.

---

## Slide 13: Results (30s)

These numbers are from a demo app I built to reproduce each step, tested on an iPhone with 1,809 photos.
RN Image: 311 megabytes RAM, nearly 4-second load time.
useImage: 4,848 megabytes - nearly 5 gigs - crashes immediately.
expo-image: 182 megabytes and 85 milliseconds. A huge improvement.
Mipmaps with expo-image: 174 megabytes and 57 milliseconds. Our final, most optimized result.

---

## Slide 14: Results Summary (30s)

Here's the summary. From the naive RN Image approach to our final mipmap solution: RAM decreased 44%, from 311 down to 174 megabytes. Load time decreased 98%, from nearly 4 seconds down to 57 milliseconds.
The biggest single improvement came from switching to expo-image. Mipmaps added the final incremental gain on top, plus the huge benefit of instant relaunch.

---

## Slide 15: Lessons Learned (50s)

Let me wrap up with five lessons.
First, don't load what you don't display. Batch loading with ph-asset references keeps your initial memory footprint near zero.
Second, the right image component matters more than anything else. Choose one that resolves asset URIs natively on the platform side, not through the JavaScript bridge.
Third, match your pixel budget to your display size. Calculate your actual pixel needs with PixelRatio, generate mipmaps at that exact size, and cache them permanently. There's no reason to decode 12 megapixels for a thumbnail.
Fourth, recycle, don't recreate. FlashList gives you smooth scrolling with no frame drops and no blank cells, even with thousands of photos.
And fifth - beware of hooks in recycled views. useImage keeps loaded images in memory, and since FlashList reuses cells instead of destroying them, old images pile up until the app crashes.

---

## Slide 16: Thank You (20s)

Thank you so much! Unfortunately we're out of time for questions on stage, but please come find me afterwards - I'd love to chat about React Native performance or anything else. Thank you!
