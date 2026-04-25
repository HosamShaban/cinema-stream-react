# Cinema Stream — React Frontend

تحويل مشروع Django إلى React + Redux Toolkit

---

## هيكل الملفات

```
src/
├── store/
│   ├── index.js                  # Redux configureStore
│   └── slices/
│       ├── authSlice.js          # login / register / profile
│       ├── moviesSlice.js        # movies list, detail, search
│       ├── otherSlices.js        # series / reviews / favorites
├── services/
│   ├── api.js                    # Axios + JWT interceptors
│   └── index.js                  # authService, moviesService, ...
├── hooks/
│   └── index.js                  # useAuth, useMovies, useFavorites
├── pages/
│   ├── HomePage.jsx              # Hero + trending rows
│   ├── BrowsePage.jsx            # Grid + filters + search
│   ├── MovieDetailPage.jsx       # Detail + reviews
│   ├── AuthPage.jsx              # Login/Register tabs
│   └── ProfilePage.jsx           # Profile + favorites
├── components/
│   ├── layout/Navbar.jsx
│   ├── movies/MovieCard.jsx
│   └── reviews/index.jsx         # StarRating, ReviewCard, ReviewForm
├── App.jsx                       # Router
└── index.js                      # Redux Provider entry
```

---

## خطوات التشغيل

### 1. Django — إضافة JWT + CORS

```bash
pip install djangorestframework-simplejwt django-cors-headers
```

انسخ محتوى `DJANGO_SETTINGS_PATCH.py` و `DJANGO_URLS_PATCH.py` في مشروع Django.

### 2. React — تثبيت وتشغيل

```bash
npx create-react-app cinema-stream-react
# انسخ مجلد src/ بالكامل
cp .env.example .env

npm install @reduxjs/toolkit react-redux axios react-router-dom
npm start
```

### 3. تقسيم otherSlices.js (مهم)

افصل `otherSlices.js` لملفات منفصلة:
- `slices/seriesSlice.js`
- `slices/reviewsSlice.js`
- `slices/favoritesSlice.js`

ثم أضفهم في `store/index.js`.

---

## الـ API Endpoints المطلوبة من Django

| Endpoint | Method | وصف |
|----------|--------|------|
| `/api/auth/login/` | POST | JWT token |
| `/api/auth/refresh/` | POST | Refresh token |
| `/api/accounts/register/` | POST | تسجيل مستخدم |
| `/api/accounts/profile/` | GET/PATCH | بيانات المستخدم |
| `/api/accounts/favorites/` | GET | قائمة المفضلة |
| `/api/movies/` | GET | قائمة الأفلام |
| `/api/movies/:id/` | GET | تفاصيل فيلم |
| `/api/movies/:id/toggle_favorite/` | POST | إضافة/إزالة مفضلة |
| `/api/series/` | GET | قائمة المسلسلات |
| `/api/series/:id/` | GET | تفاصيل مسلسل |
| `/api/reviews/` | GET/POST | عرض/إنشاء تقييم |
| `/api/reviews/:id/` | PATCH/DELETE | تعديل/حذف تقييم |

---

## ملاحظات

- `MovieDetailPage` يعمل للأفلام والمسلسلات (route `/movie/:id` و `/series/:id`)
- تقسيم `otherSlices.js` إلى ملفات منفصلة مطلوب قبل الـ production
- الـ `useAuth` hook يوفر كل عمليات المصادقة
