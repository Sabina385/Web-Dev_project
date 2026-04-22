export interface Genre {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name?: string;
  username?: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  duration: number;
  rating_avg?: number; 
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
  movie: number | Movie;
  user: User;
}

export interface Rating {
  id: number;
  value: number;
  movie: number | Movie;
  user: User | number;
}

export interface Watchlist {
  id: number;
  user: number;
  movie: number;
  added_at: string;
}

export interface Recommendation {
  id: number;
  from_user: User;
  to_user: User;
  movie: Movie;
  message: string;
  created_at: string;
}
