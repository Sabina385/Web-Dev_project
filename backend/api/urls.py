from django.urls import path
from .views import *

urlpatterns = [
    # auth
    path('login/', LoginAPIView.as_view()),
    path('register/', RegisterAPIView.as_view()),

    # movies
    path('movies/', MovieListAPIView.as_view()),
    path('movies/create/', MovieCreateAPIView.as_view()),
    path('movies/<int:pk>/', MovieDetailAPIView.as_view()),
    path('movies/<int:pk>/update/', MovieUpdateAPIView.as_view()),
    path('movies/<int:pk>/delete/', MovieDeleteAPIView.as_view()),

    # cast
    path('actors/', ActorListAPIView.as_view()),
    path('movies/<int:movie_id>/cast/', CastMovieAPIView.as_view()),

    # reviews
    path('reviews/create/', ReviewCreateAPIView.as_view()),
    path('reviews/<int:movie_id>/', ReviewListAPIView.as_view()),

    # ratings
    path('ratings/', RatingAPIView.as_view()),
    path('ratings/<int:movie_id>/', MovieRatingAPIView.as_view()),
    
    #watchlist
    path('watchlist/',WatchlistAPIView.as_view()),
    
    #recommendations
    path('recommendations/send/',RecommendationAPIView.as_view()),
    path('recommendations/',RecommendationListAPIView.as_view()),
]