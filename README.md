# Cinema Stream — React Frontend

> A modern React frontend for the Cinema Stream Django application. Built with React, Redux Toolkit, and Axios — connecting seamlessly to the existing Django REST API.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux) ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4) ![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

This is the **React frontend** for [Cinema Stream](https://github.com/HosamShaban/Cinema-Stream) — a Netflix-inspired streaming web app. It replaces Django's template-based UI with a fully decoupled SPA while keeping the original Django backend untouched (except for a few JSON API endpoints and CORS setup).

> **Live Django Backend:** https://cinema-stream-web.fly.dev  
> Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
>
> <img width="1440" height="723" alt="Screenshot 2025-11-27 at 4 01 30 PM" src="https://github.com/user-attachments/assets/2048b5d0-9a75-42e5-924e-31cca0e87263" />

---

## Features

| Feature | Status |
|---|---|
| User Registration & Login (Email-based) | ✅ Done |
| Combined Login/Register Tabs | ✅ Done |
| User Profile + Avatar Upload | ✅ Done |
| Edit Profile | ✅ Done |
| Favorites / Watchlist | ✅ Done |
| Persistent Favorites (survives refresh) | ✅ Done |
| Movie & Series Detail Pages | ✅ Done |
| Content Type Badge (Movie / Series) | ✅ Done |
| Star Rating + Reviews System | ✅ Done |
| Edit / Delete Own Reviews | ✅ Done |
| Real-time Search & Suggestions | ✅ Done |
| Browse with Filters (Type, Genre, Year) | ✅ Done |
| Load More Pagination | ✅ Done |
| Trailer Link | ✅ Done |
| Responsive Design | ✅ Done |
| Session-based Auth (Django sessions) | ✅ Done |
| Protected Routes | ✅ Done |

---

## Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Redux Toolkit** — Global state management
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with CSRF interceptors

### Backend (existing Django project)
- **Django 5+** — REST API endpoints
- **Session-based Auth** — No JWT needed
- **CORS Headers** — Configured for `localhost:3000`

---

## Project Structure

```
src/
├── store/
│   ├── index.js                    # Redux configureStore
│   └── slices/
│       ├── authSlice.js            # login / register / profile / session
│       ├── moviesSlice.js          # movies list, detail, search
│       ├── seriesSlice.js          # series list, detail
│       ├── reviewsSlice.js         # CRUD reviews
│       └── favoritesSlice.js       # add / remove favorites
├── services/
│   ├── api.js                      # Axios instance + CSRF interceptor
│   ├── authService.js              # login, register, profile, logout
│   └── index.js                    # moviesService, reviewsService, ...
├── hooks/
│   ├── useAuth.js
│   ├── useMovies.js
│   ├── useFavorites.js
│   └── index.js
├── pages/
│   ├── HomePage.jsx                # Recently Added, Top Movies/Series, Trending
│   ├── BrowsePage.jsx              # Grid + sidebar filters + load more
│   ├── MovieDetailPage.jsx         # Detail + trailer + favorites + reviews
│   ├── AuthPage.jsx                # Login / Register tabs
│   ├── ProfilePage.jsx             # Favorites + reviews + member info
│   └── EditProfilePage.jsx         # Edit name, email, avatar
├── components/
│   ├── layout/
│   │   ├── Layout.jsx              # Shared wrapper (Navbar + Footer)
│   │   ├── Navbar.jsx              # Fixed nav + search suggestions
│   │   └── Footer.jsx
│   ├── common/
│   │   └── ProtectedRoute.jsx      # Auth guard with session check
│   └── movies/
│       └── MovieCard.jsx
├── App.jsx                         # Router + loadProfile on startup
└── index.js                        # Redux Provider entry
```

---

## Django Setup (Required)

### 1. Install packages
```bash
pip install django-cors-headers
```

### 2. Add to `settings.py`
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SAMESITE = 'Lax'
```

### 3. Add API endpoints to `urls.py`
```python
path('api/auth/login/',        views.api_login,         name='api_login'),
path('api/auth/register/',     views.api_register,      name='api_register'),
path('api/auth/me/',           views.api_me,            name='api_me'),
path('api/auth/logout/',       views.api_logout,        name='api_logout'),
path('api/auth/edit-profile/', views.api_edit_profile,  name='api_edit_profile'),
path('api/home/',              views.api_home,          name='api_home'),
path('api/browse/',            views.api_browse,        name='api_browse'),
path('api/movie/<slug:slug>/', views.api_movie_detail,  name='api_movie_detail'),
path('api/series/<slug:slug>/',views.api_series_detail, name='api_series_detail'),
path('api/review/',            views.api_reviews,       name='api_reviews'),
path('api/review/submit/',     views.api_post_review,   name='api_post_review'),
path('api/review/<int:review_id>/delete/', views.api_delete_review, name='api_delete_review'),
path('api/favorite/toggle/',   views.ToggleFavoriteView.as_view(), name='api_toggle_favorite'),
path('api/favorites/',         views.api_favorites,     name='api_favorites'),
path('api/user-reviews/',      views.api_user_reviews,  name='api_user_reviews'),
```

---

## Installation

```bash
# 1. Clone
git clone https://github.com/HosamShaban/cinema-stream-react.git
cd cinema-stream-react

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env → set REACT_APP_API_URL=http://localhost:8000/api

# 4. Start Django backend (separate terminal)
cd ../Cinema-Stream/cinema_stream_project
python3 manage.py runserver

# 5. Start React
npm start
```

Then visit: **http://localhost:3000**

---

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Key Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | Recently Added, Top Movies, Top Series, Trending |
| `/browse` | Browse | Filters by type, genre, year + load more |
| `/movie/:slug` | Movie Detail | Poster, info, trailer, favorites, reviews |
| `/series/:slug` | Series Detail | Same layout, series-specific data |
| `/profile` | Profile | Favorites grid + reviews list |
| `/profile/edit` | Edit Profile | Name, email, avatar |
| `/login` | Auth | Login + Register tabs |

---

## Security

- CSRF token auto-attached to every request via Axios interceptor
- Session-based authentication (Django sessions)
- Protected routes wait for session check before redirecting
- Only review owners can delete their reviews

---

## Roadmap

- [ ] Watch history & "Continue Watching"
- [ ] Personalized recommendations
- [ ] Dark / Light mode toggle
- [ ] Mobile app (Flutter)
- [ ] Multi-language support (i18n)

---

## Related

- **Django Backend:** [Cinema-Stream](https://github.com/HosamShaban/Cinema-Stream)

---

## License

This project is licensed under the MIT License.

> Cinema Stream — Watch Like Never Before
