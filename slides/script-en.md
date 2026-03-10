# Speaker Script (English Only)

Target: ~15 minutes (~1,800 words at 130 WPM)

---

## Slide 1: Title (20s)

Hi everyone, thank you for being here!
We were building an in-app gallery.
Users scroll through their photos, pick one, done.
Simple, right?
But when they scrolled fast, the app crashed.
Just gone.
That's a terrible experience.
So we had to fix it.
And today, I want to share what we learned.

---

## Slide 2: About Me (30s)

I'm Miryang Jung.
I'm a Senior Frontend Engineer at Grandeclip.
I'm really happy to be here in Thailand.
This is the land of Muay Thai!
I bought a lot of boxing gear at Twins.
I've been boxing for about a year now.
So this trip is extra special for me.
For this talk, I built a demo app.
It shows each step of the fix.
I tested it on a simulator.
Your numbers may be different.
But the pattern should be the same.
OK, let's get into it.

---

## Slide 3: Why Build an In-App Photo Picker? (40s)

Why did we build our own photo picker?
The system picker on iOS and Android works fine for simple cases.
But it has limits.
We needed custom album lists.
We needed masonry layouts and different grid sizes.
We needed multi-select with our own UI.
The system picker can't do any of that.
So we built our own gallery.
And that's when the problems started.

---

## Slide 4: The Problem (50s)

Here is the simplest code.
We put RN Image in a FlashList.
We load 1,809 photos from the device.
What happens?
The screen is blank for over 2 seconds.
Then RAM jumps to 2.3 gigabytes.
After the peak, it goes back down to 311 megabytes.
But the loading is terrible.
Why?
RN Image can't use ph:// URIs directly.
It needs an async call for each photo to get the file path first.
And each cell loads the full-size photo — 8 to 24 megapixels — just for a tiny thumbnail.
This won't work.
How do we fix it?

---

## Slide 5: How Other Gallery Apps Solve This (40s)

Before we write code, let's look at how other gallery apps do it.
They show thousands of photos smoothly.
How?
First, they load metadata only.
The real image data comes later.
Second, they use small thumbnails that match the display size.
Third, they recycle views.
When a cell scrolls away, it gets reused for a new photo.
Fourth, they load step by step.
Placeholder first, then thumbnail, then full image.
We will use these same ideas in React Native.

---

## Slide 6: Batch Loading & Caching (50s)

First step: loading.
We don't load all 1,809 photos at once.
We use expo-media-library to load 50 at a time.
Here's the key point.
The ph:// URI is just a reference.
It's like an ID for a photo in the iOS Photos library.
It has no pixel data.
No memory is used until we try to show it.
We use endCursor to load the next page.
This gives us infinite scroll.
This is our base.
Light references, not heavy image data.
Now we have the references.
But how do we show them on screen?

---

## Slide 7: Rendering - RN Image + FlashList (50s)

Next: rendering.
I first tried the built-in RN Image.
The problem?
RN Image can't use ph:// URIs on iOS.
You need to call getAssetInfoAsync first.
This turns the ph:// URI into a file path.
That's an async call for every cell.
Look at the demo.
The average load time is 3,796 milliseconds.
That's almost 4 seconds of blank cells.
RAM is 311 megabytes.
Not too bad.
But the scrolling is not smooth.
4 seconds of blank cells is not good enough.
We need a better image component.

---

## Slide 8: Rendering - useImage Trap (60s)

Still on rendering.
I looked for other options.
I found an Expo GitHub issue about the memory problem.
Someone suggested using the useImage hook from expo-image.
It sounded promising.
But when I used useImage with FlashList, it was a disaster.
RAM went up to 4,848 megabytes.
That's almost 5 gigs.
The app crashed right away.
Why?
useImage is a React hook.
It manages image loading as component state.
But FlashList recycles cells.
It doesn't unmount them.
So the hook never cleans up.
Old image references stay in memory.
They keep piling up.
It's a memory leak.
The lesson: be careful with hooks in recycled views.
We need a component that handles images on the native side, not through JS state.

---

## Slide 9: Rendering - expo-image + FlashList (40s)

The answer is simple.
Use the expo-image component directly.
Not through a hook.
expo-image handles ph:// URIs on the native side.
No async JavaScript calls.
And here's the key — it doesn't load the full 24 megapixel image.
It uses iOS PHImageManager with a target size matching the view.
So it only requests the pixels it actually needs for display.
It also supports view recycling with the recyclingKey prop.
When a cell is reused, recyclingKey tells expo-image to clear the old image and load the new one.
The results are great.
Load time: 85 milliseconds.
That's 45 times faster than RN Image.
RAM: 182 megabytes.
Smooth scrolling.
But every time a cell appears, iOS still has to fetch and resize the photo from the library.
Can we skip that step entirely?

---

## Slide 10: Decoding - Mipmaps Concept (50s)

Now, decoding.
This is where mipmaps take it further.
expo-image already asks iOS for a smaller version.
That's great.
But every time a new cell appears, iOS still has to find the photo in the library, resize it, and return it.
What if we pre-generate small JPEG thumbnails and cache them on disk?
That's mipmapping.
One-time cost, then reuse forever.
Our grid cell is 98 by 98 points.
On a 3x retina screen, that's 294 by 294 pixels.
We make a small JPEG at exactly that size.
About 20 to 30 kilobytes.
On second launch, the thumbnails are already on disk.
No waiting for PHImageManager.
And these cached images are easy to reuse anywhere in the app — different screens, different components.

---

## Slide 11: Decoding - Mipmap Size Calculation (40s)

First step: figure out the right size.
We divide the screen width by 4.
That's our grid cell width.
Then we use PixelRatio to turn points into pixels.
This is important.
Different devices have different pixel density.
iPhone Pro is 3x.
So 98 points becomes 294 pixels.
iPhone SE is 2x.
So 98 points becomes 196 pixels.
We make thumbnails at the exact size each device needs.
Not bigger.
Not smaller.
The cache key has the mipmap width in it.
If the grid changes — say from 4 columns to 3 — the key changes too.
New thumbnails are made at the right size.

---

## Slide 12: Decoding - Mipmap Generation & Caching (50s)

Now, the pipeline.
We use expo-image-manipulator to resize each photo.
We save it as a JPEG at 90 percent quality.
The result is tiny.
About 20 to 30 kilobytes.
The original is 1.5 to 4 megabytes.
Each mipmap is saved to the app's folder.
We use MMKV to track them.
MMKV is a fast key-value store.
We always check the cache first.
If the file is there, we skip it.
No need to make it again.
We process 10 photos at a time with Promise.all.
For 1,809 photos, the total cache is only about 40 megabytes on disk.
First launch takes a few seconds.
But after that, everything loads from cache right away.

---

## Slide 13: Decoding - Mipmaps Result (30s)

Here are the results.
RAM: 174 megabytes.
That's 4% less than expo-image alone.
Load time: 57 milliseconds.
33% faster.
But the real win is the second launch.
Mipmaps are saved on disk.
MMKV tracks them.
So the gallery loads almost right away next time.
No more waiting.
The last piece is the list component.

---

## Slide 14: Scrolling - FlashList (40s)

Last part: scrolling.
FlatList creates a new component for every cell.
When a cell scrolls away, it's destroyed.
With many photos, this means dropped frames and blank cells.
FlashList is different.
It works like UICollectionView on iOS.
When a cell scrolls away, it reuses that cell for the next item.
The scrolling is smooth.
No blank areas.
The recyclingKey prop tells expo-image that the cell now shows a different photo.
It clears the old image and loads the new one.
FlashList plus expo-image plus mipmaps.
That's the full picture.
Let's compare all four methods.

---

## Slide 15: Results (30s)

These numbers are from my demo app.
Tested on an iPhone simulator with 1,809 photos.
RN Image: 311 megabytes.
Almost 4 seconds to load.
useImage: 4,848 megabytes.
App crashes.
expo-image: 182 megabytes.
85 milliseconds.
Mipmaps plus expo-image: 174 megabytes.
57 milliseconds.
The best result.

---

## Slide 16: Results Summary (30s)

Here is the summary.
From RN Image to mipmaps: RAM went down 44%.
From 311 to 174 megabytes.
Load time went down 98%.
From almost 4 seconds to 57 milliseconds.
The biggest win was switching to expo-image.
Mipmaps added a smaller gain on top.
Plus, the second launch is instant.

---

## Slide 17: Lessons Learned (50s)

Let me finish with five lessons.
One. Don't load what you don't show.
Use batch loading with ph:// references.
Keep memory low from the start.
Two. The right image component is the most important choice.
Pick one that handles asset URIs on the native side.
Not through the JavaScript bridge.
Three. Pre-generate and cache your thumbnails.
Even though expo-image downscales for you, pre-made mipmaps skip PHImageManager entirely.
They load faster, and you can reuse them across any screen in the app.
Four. Recycle, don't recreate.
FlashList gives smooth scrolling with no blank cells.
Even with thousands of photos.
Five. Be careful with hooks in recycled views.
useImage manages images as hook state.
FlashList recycles cells without unmounting them.
So the hook never cleans up.
Old references pile up and the app crashes.

---

## Slide 18: Thank You (20s)

Thank you!
Unfortunately, we don't have time for questions on stage.
But please send me a message on LinkedIn. I'd love to chat!
Thank you!
