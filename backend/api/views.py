from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from django.db.models import Avg
from .models import Movie, Review, Rating,  Actor, CastMovie, Recommendation, Watchlist
from .serializers import (
    MovieSerializer,
    MovieCreateSerializer,
    ReviewSerializer,
    LoginSerializer,
    RegisterSerializer,
    ActorSerializer, 
    CastMovieSerializer,
    WatchlistSerializer,
    RecommendationSerializer,
    CastMovieCreateSerializer,
    RecommendationCreateSerializer
)


# LOGIN
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(**serializer.validated_data)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

# REGISTER
class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created'})
        return Response(serializer.errors)


# MOVIE
# GET ALL MOVIES
class MovieListAPIView(APIView):
    def get(self, request):
        movies = Movie.objects.all()
        
        search = request.GET.get('search')
        genre = request.GET.get('genre')

        if search:
            movies = movies.filter(title__icontains=search)

        if genre:
            movies = movies.filter(moviegenre__genre__name__icontains=genre)
            
        paginator = PageNumberPagination()
        paginator.page_size = 5 
        
        result_page = paginator.paginate_queryset(movies, request)   
        serializer = MovieSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
# GET ONE MOVIE
class MovieDetailAPIView(APIView):
    def get(self, request, pk):
        movie = get_object_or_404(Movie, id=pk)
        serializer = MovieSerializer(movie)
        return Response(serializer.data)

# CREATING MOVIE
class MovieCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        if not request.user.is_staff:
            return Response({"error": "Only admin can add movies"}, status=403)
        
        serializer = MovieCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

# UPDATE MOVIE
class MovieUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        
        if not request.user.is_staff:
            return Response({"error": "Only admin can update movies"}, status=403)
        
        movie = get_object_or_404(Movie, id=pk)
        serializer = MovieCreateSerializer(movie, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
# DELETE MOVIE
class MovieDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        
        if not request.user.is_staff:
            return Response({"error": "Only admin can delete movies"}, status=403)
        
        movie = get_object_or_404(Movie, id=pk)
        movie.delete()
        return Response({'message': 'Deleted'})


# USER REVIEW 
# CREATE REVIEW
class ReviewCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors)

# GET REVIEW BY MOVIE
class ReviewListAPIView(APIView):
    def get(self, request, movie_id):
        reviews = Review.objects.filter(movie_id=movie_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    

# RATING
# CREATE OR UPDATE RATING
class RatingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        movie_id = request.data.get('movie')
        value = request.data.get('value')

        rating, created = Rating.objects.get_or_create(
            user=request.user,
            movie_id=movie_id,
            defaults={'value': value}
        )

        if not created:
            rating.value = value
            rating.save()

        return Response({'message': 'Rating saved'})
    
# GET AVG OF RATING
class MovieRatingAPIView(APIView):
    def get(self, request, movie_id):
        avg = Rating.objects.filter(movie_id=movie_id).aggregate(Avg('value'))
        return Response({'average': avg['value__avg']})


# ACTORS
class ActorListAPIView(APIView):
    def get(self, request):
        actors = Actor.objects.all()
        serializer = ActorSerializer(actors, many=True)
        return Response(serializer.data)
    
class CastMovieAPIView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request, movie_id):
        cast = CastMovie.objects.filter(movie_id=movie_id)
        serializer = CastMovieSerializer(cast, many=True)
        return Response(serializer.data)

    def post(self, request, movie_id):
        if not request.user.is_staff:
           return Response({"error": "Admin Only"}, status=status.HTTP_403_FORBIDDEN)
        serializer = CastMovieCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        actor_id = request.data.get('actor_id')
        role_name = request.data.get('role_name', '')

        actor = get_object_or_404(Actor, id=actor_id)
        movie = get_object_or_404(Movie, id=movie_id)

        cast, created = CastMovie.objects.get_or_create(
            movie_id=movie_id,
            actor_id=actor_id,
            defaults={'role_name': role_name}
        )
        return Response(CastMovieSerializer(cast).data)
    
class WatchlistAPIView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        watchlist = Watchlist.objects.filter(user=request.user).select_related('movie')
        serializer = MovieSerializer(
            [item.movie for item in watchlist], many=True
        )
        return Response(serializer.data)
    def post(self,request):
        movie_id=request.data.get('movie')
        
        obj, created=Watchlist.objects.get_or_create(
            user=request.user,
            movie_id=movie_id
        )   
        
        if not created:
            return Response({'message':'Already in watchlist'},status=status.HTTP_200_OK)    
        
        return Response({'message':'Added to watchlist'},status=status.HTTP_201_CREATED)
    def delete(self,request):
        movie_id = request.data.get('movie')
        Watchlist.objects.filter(user=request.user, movie_id=movie_id).delete()
        return Response({'message': 'Removed'})
        
class RecommendationAPIView(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request):
        serializer = RecommendationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        to_username=data['to_username']
        movie_title=data['movie_title']
        message=data.get('message', '') 
        
        to_user = get_object_or_404(User, username=to_username)
        if to_user==request.user:
            return Response({'error': 'You can not recommend yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
        
        movie = get_object_or_404(Movie, title=movie_title)
          
        Recommendation.objects.create(
            from_user=request.user,
            to_user=to_user,
            movie=movie,
            message=message
        )

        return Response({'message': 'Recommendation sent'},status=status.HTTP_201_CREATED)     
      
class RecommendationListAPIView(APIView): 
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        recs = Recommendation.objects.filter(to_user=request.user)
        serializer = RecommendationSerializer(recs, many=True)
        return Response(serializer.data)
      
    