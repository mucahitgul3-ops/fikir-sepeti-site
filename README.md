# Fikir Sepeti

Sakarya Teknokent'in kurum içi fikir dosyası. Bu depo yalnızca sitenin kabuğunu içerir;
fikirlerin metni burada değil, giriş yapan üyelere Firebase'den yüklenir.

- Yayın: Cloudflare Pages bu depodaki her değişikliği otomatik yayınlar (derleme yok, çıktı klasörü: kök).
- İçerik güncellemesi: `fikir-sepeti-icerik.json` dosyası admin.html → İçerik sekmesinden yüklenir. Bu dosya depoya konmaz.
- Güvenlik kuralları: `firestore.rules` (Firebase konsoluna yapıştırılır; yönetici e-postası orada yazılıdır).
