# Vidéo d'annonce TikTok (sans musique ni voix)

- `ai-content-creator-promo-tiktok.mp4` : 1080×1920, 30 i/s, 24 s, piste audio absente (le texte porte tout le message).
- Régénérer : `node promo/build-promo.mjs <dossier-images>` puis
  `ffmpeg -framerate 30 -i <dossier-images>/%04d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -an -movflags +faststart promo/ai-content-creator-promo-tiktok.mp4`
- Le script a besoin du PDF généré (`npm run build`), de `pdftotext`/`pdftoppm` (poppler) et de ffmpeg. Les visuels sont de vraies pages du livre.
- Pour ajouter un son tendance : importez la vidéo dans TikTok et choisissez un son depuis la bibliothèque de l'application.
