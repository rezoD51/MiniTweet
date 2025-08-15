# MiniTweet – Takip Tabanlı Tweet Platformu

Bu proje, React.js (Vite), Express.js ve MongoDB kullanılarak geliştirilmiş, takip tabanlı bir mini tweet platformudur. JWT kimlik doğrulama, RESTful API tasarımı ve modern frontend teknikleri gibi konuları kapsamaktadır.

## ⚙️ Kullanılan Teknolojiler

**Frontend:**
*   React.js (Vite ile)
*   TailwindCSS
*   Axios
*   React Router
*   React Context + useReducer
*   Lucide React (İkonlar)
*   Date-fns (Tarih formatlama)

**Backend:**
*   Node.js + Express.js
*   MongoDB + Mongoose
*   JWT (jsonwebtoken)
*   bcryptjs
*   CORS + Morgan
*   dotenv

## 📁 Proje Dosya Yapısı
(Yukarıda verilen dosya yapısını buraya ekleyebilirsiniz)

## 🚀 Proje Çalıştırma Adımları

### Ön Gereksinimler
*   Node.js (v18 veya üzeri önerilir)
*   npm (Node.js ile birlikte gelir)
*   MongoDB (yerel olarak çalışan veya bir Atlas URI'si)

### Kurulum

1.  **Projeyi İndirin veya Klonlayın:**
    Bu depoyu bilgisayarınıza klonlayın veya ZIP olarak indirin ve açın.

2.  **Backend Kurulumu:**
    *   Terminalde `MiniTweet/server` dizinine gidin:
        ```bash
        cd MiniTweet/server
        ```
    *   Gerekli paketleri yükleyin:
        ```bash
        npm install
        ```
    *   `server` dizininde ` .env.example` dosyasını `.env` olarak kopyalayın.
    *   `server/.env` dosyasını kendi MongoDB URI'niz ve JWT secret'ınız ile güncelleyin:
        ```env
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/minitweet_db # Kendi MongoDB bağlantı dizginiz
        JWT_SECRET=cokgizlibiranahtarolmali # Güçlü bir gizli anahtar belirleyin
        CLIENT_URL=http://localhost:5173 # Client'ın çalıştığı adres (Vite varsayılanı)
        ```

3.  **Frontend Kurulumu:**
    *   Terminalde `MiniTweet/client` dizinine gidin:
        ```bash
        cd ../client 
        # veya yeni bir terminalde: cd MiniTweet/client
        ```
    *   Gerekli paketleri yükleyin:
        ```bash
        npm install
        ```
    *   `client` dizininde `.env.example` dosyasını `.env` olarak kopyalayın.
    *   `client/.env` dosyasının içeriğini kontrol edin (genellikle varsayılan doğrudur):
        ```env
        VITE_API_BASE_URL=http://localhost:5000/api # Backend API adresiniz
        ```

### Uygulamayı Çalıştırma

1.  **MongoDB Sunucusunu Başlatın:**
    Eğer yerel MongoDB kullanıyorsanız, çalıştığından emin olun.

2.  **Backend Sunucusunu Başlatma:**
    *   `MiniTweet/server/` dizinindeyken terminalde çalıştırın:
        ```bash
        npm run dev 
        ```
    *   Sunucu varsayılan olarak `http://localhost:5000` adresinde çalışacaktır. Konsolda "MongoDB Connected Successfully!" ve "Server is sizzling on port 5000" mesajlarını görmelisiniz.

3.  **Frontend Geliştirme Sunucusunu Başlatma:**
    *   Yeni bir terminal açın.
    *   `MiniTweet/client/` dizinindeyken çalıştırın:
        ```bash
        npm run dev
        ```
    *   Uygulama varsayılan olarak `http://localhost:5173` adresinde tarayıcınızda açılacaktır.
