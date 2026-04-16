export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  duration: number;
  avg_rating?: number; 
  images: { image_url: string }[];
  genres: { genre: { name: string } }[];
}

export interface MovieGenre {
  id: number;
  movie: number;
  genre: number;
}

export interface MovieImage {
  id: number;
  movie: number;
  image_url: string;
}

export interface Actor {
  id: number;
  name: string;
  bio?: string;
  birth_date?: string;
}

export interface CastMovie {
  id: number;
  movie: number;
  actor: number;
  role_name: string;
}

export interface Review {
  id: number;
  text: string;
  movie: number;
  user: number;
}

export interface Rating {
  id: number;
  value: number;
  movie: number;
  user: number;
}

export interface Watchlist {
  id: number;
  user: number;
  movie: number;
  added_at: string;
}

export interface Recommendation {
  id: number;
  from_user: number;
  to_user: number;
  movie: number;
  message: string;
  created_at: string;
}