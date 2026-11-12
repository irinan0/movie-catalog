from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List, Optional
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app = FastAPI(
    title="Movie Catalog API (TMDB Powered)",
    description="Backend API integrated with TMDB for real-time movies and streaming services",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_API_KEY = "52adfaddae17f923efce68f3201995c3"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

# Карта жанров TMDB
GENRES_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western"
}

@app.get("/")
def read_root():
    return {"message": "Movie Catalog API with TMDB Integration is running!"}

@app.get("/api/v1/genres")
def get_genres():
    return sorted(list(GENRES_MAP.values()))

@app.get("/api/v1/movies")
async def get_movies(
    genre: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("title"),
    order: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1)
):
    async with httpx.AsyncClient() as client:
        # 1. Add TMDB API request to fetch popular movies
        url = f"{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&page={page}&language=en-US"
        response = await client.get(url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch data from TMDB")
        
        data = response.json()
        raw_movies = data.get("results", [])
        movies_list = []

        for item in raw_movies:
            movie_id = item["id"]
            
            # Determine the primary genre
            genre_ids = item.get("genre_ids", [])
            movie_genre = GENRES_MAP.get(genre_ids[0], "Other") if genre_ids else "Other"

            # Filter by genre on the backend
            if genre and genre.lower() != "all" and movie_genre.lower() != genre.lower():
                continue

            # 2. Add request for streaming providers (JustWatch data)
            providers_url = f"{TMDB_BASE_URL}/movie/{movie_id}/watch/providers?api_key={TMDB_API_KEY}"
            prov_resp = await client.get(providers_url)
            prov_data = prov_resp.json().get("results", {}).get("US", {})
            
            flatrate = prov_data.get("flatrate", [])
            rent_buy = prov_data.get("rent", []) + prov_data.get("buy", [])
            all_providers = flatrate if flatrate else rent_buy

            streaming_services = []
            seen_providers = set()
            
            for provider in all_providers:
                p_name = provider["provider_name"]
                if p_name not in seen_providers:
                    seen_providers.add(p_name)
                    streaming_services.append({
                        "name": p_name,
                        "url": prov_data.get("link", "https://www.themoviedb.org"),
                        "available": True
                    })

            # If no streaming services are found, provide default options
            if not streaming_services:
                streaming_services = [
                    {"name": "Apple TV", "url": "https://tv.apple.com", "available": True},
                    {"name": "Amazon Video", "url": "https://www.amazon.com", "available": True}
                ]

            poster_path = item.get("poster_path")
            poster_url = f"{IMAGE_BASE_URL}{poster_path}" if poster_path else "https://via.placeholder.com/500x750?text=No+Poster"

            movies_list.append({
                "id": movie_id,
                "title": item.get("title", "Untitled"),
                "year": int(item.get("release_date", "2024")[:4]) if item.get("release_date") else 2024,
                "genre": movie_genre,
                "poster_url": poster_url,
                "description": item.get("overview", "No description available."),
                "streaming_services": streaming_services
            })

        # 3. Sorting
        reverse_flag = True if order == "desc" else False
        if sort_by == "year":
            movies_list.sort(key=lambda x: x["year"], reverse=reverse_flag)
        else:
            movies_list.sort(key=lambda x: x["title"].lower(), reverse=reverse_flag)

        return movies_list
