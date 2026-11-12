from pydantic import BaseModel
from typing import List

class StreamingService(BaseModel):
    name: str
    url: str
    available: bool

class Movie(BaseModel):
    id: int
    title: str
    year: int
    genre: str
    poster_url: str
    description: str
    streaming_services: List[StreamingService]
