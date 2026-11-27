# Promo video (TikTok / Reels, 1080x1920, 20 s)

- `creator-starter-kit-promo-tiktok.mp4` — video + original beat
- `creator-starter-kit-promo-sans-musique.mp4` — same video, no audio (add a trending sound inside TikTok)
- `creator-starter-kit-beat-original.wav` — the original, royalty-free beat (made by `make_music.py`)
- Rebuild: `python3 make_music.py beat.wav` then `npx tsx promo/build-promo.ts frames/` then ffmpeg (see git history / README).

The music is synthesised from scratch (no samples, no third-party material). No trending/copyrighted track is included.
