from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import Movie, Review, Rating
from .serializers import (
    MovieSerializer,
    MovieCreateSerializer,
    ReviewSerializer,
    RatingSerializer,
    LoginSerializer,
    RegisterSerializer
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

        return Response({'error': 'Invalid credentials'})
    

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
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)
    
# GET ONE MOVIE
class MovieDetailAPIView(APIView):
    def get(self, request, pk):
        movie = Movie.objects.get(id=pk)
        serializer = MovieSerializer(movie)
        return Response(serializer.data)

# CREATING MOVIE
class MovieCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MovieCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

# UPDATE MOVIE
class MovieUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        movie = Movie.objects.get(id=pk)
        serializer = MovieCreateSerializer(movie, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    
# DELETE MOVIE
class MovieDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        movie = Movie.objects.get(id=pk)
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
from django.db.models import Avg

class MovieRatingAPIView(APIView):
    def get(self, request, movie_id):
        avg = Rating.objects.filter(movie_id=movie_id).aggregate(Avg('value'))
        return Response({'average': avg['value__avg']})