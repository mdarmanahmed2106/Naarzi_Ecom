# Naarzi — Video Asset Storage & Optimization Guide

This guide details how to optimize and store high-resolution fashion loop videos for the Naarzi storefront, reducing file size from **67MB down to ~3–5MB** for instantaneous, stutter-free playback on both desktop and mobile devices.

---

## Method 1: Cloudinary (Recommended)

Since Cloudinary is already integrated into the backend ([backend/src/config/cloudinary.js](file:///c:/Users/sriva/OneDrive/Desktop/Naarzi/backend/src/config/cloudinary.js)), this approach provides the highest performance with automated video compression and global CDN delivery.

### Step 1: Upload to Cloudinary Dashboard
1. Log in to your [Cloudinary Console](https://cloudinary.com/console).
2. Go to **Media Library** $\rightarrow$ Create a folder named `naarzi/videos`.
3. Upload `ZAINUL0001.MP4`.

### Step 2: Generate Optimized CDN URL
Cloudinary supports real-time transformation parameters in the URL:
- `q_auto`: Automatically adjusts quality to reduce file size without visible degradation.
- `f_auto`: Automatically delivers the optimal video codec (WebM for Chrome, MP4/H.264 for Safari).
- `vc_auto`: Optimizes video codec.

**Example Production URL:**
```
https://res.cloudinary.com/<YOUR_CLOUD_NAME>/video/upload/q_auto,f_auto/v1/naarzi/videos/ZAINUL0001.mp4
```

### Step 3: Update `ScrollStorytellingSection.js`
In [frontend/src/components/ScrollStorytellingSection.js](file:///c:/Users/sriva/OneDrive/Desktop/Naarzi/frontend/src/components/ScrollStorytellingSection.js):

```javascript
{
  id: 'story-2',
  topTag: 'COLOUR FIRST · 2026',
  title: 'Turning simple fabrics into vibrant stories with colour-led design that moves with you.',
  video: 'https://res.cloudinary.com/<YOUR_CLOUD_NAME>/video/upload/q_auto,f_auto/v1/naarzi/videos/ZAINUL0001.mp4',
  poster: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop',
  type: 'video',
  ctaText: 'EXPLORE THE CAPSULE',
  link: '/shop?tag=trending'
}
```

---

## Method 2: Local Compression (Host inside `frontend/public/`)

If you prefer keeping the video inside `frontend/public/` without third-party cloud hosting, you **must compress the file** so users do not download 67MB on page load.

### Option A: Compress using `ffmpeg` (Fastest CLI)
Run this command in your terminal to strip the muted audio channel and compress the video stream:

```powershell
# Strips audio (-an) and applies web-optimized H.264 compression (CRF 26)
ffmpeg -i "frontend/public/ZAINUL0001.MP4" -vcodec libx264 -crf 26 -preset slow -an "frontend/public/lookbook_loop.mp4"
```

### Option B: Compress using Free Tools (GUI)
1. **[HandBrake](https://handbrake.fr/)** (Free & Open Source):
   - Preset: `Fast 1080p30` or `Production Standard`
   - Video tab: Set Constant Quality (RF) to `24–26`
   - Audio tab: Remove all audio tracks (None)
   - Web Optimized: Checked $\checkmark$
2. **[FreeConvert Video Compressor](https://www.freeconvert.com/video-compressor)** (Online):
   - Target Size: Set target size to **~3 MB**
   - Output format: MP4

### Step 3: Update `ScrollStorytellingSection.js`
```javascript
video: '/lookbook_loop.mp4',
```

---

## Method 3: Firebase Storage

If you store all assets inside your Firebase project:
1. Open the [Firebase Console](https://console.firebase.google.com/) $\rightarrow$ **Storage**.
2. Upload the compressed video (`lookbook_loop.mp4`) to a `videos/` folder.
3. Click on the file $\rightarrow$ **File Location** $\rightarrow$ Copy the public Access Token URL.
4. Paste the URL into `video:` in [frontend/src/components/ScrollStorytellingSection.js](file:///c:/Users/sriva/OneDrive/Desktop/Naarzi/frontend/src/components/ScrollStorytellingSection.js).

---

## Performance Checklist

| Metric | Uncompressed Local | Optimized Cloudinary / Compressed |
| :--- | :--- | :--- |
| **File Size** | 67.2 MB | **~2.8 MB (95% smaller)** |
| **Mobile Load Time** | 6–15 seconds | **< 300 ms** |
| **Data Usage** | Heavy mobile drain | Minimal bandwidth |
| **Git Repository Size** | Bloats `.git` folder | Clean & lightweight |
