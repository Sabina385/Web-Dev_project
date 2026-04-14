from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Movie, Genre, MovieGenre, MovieImage, Review, Rating, Actor, CastMovie


# USER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


# AUTH
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

# REGISTER
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

# ACTORS
class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ['id', 'name', 'bio', 'birth_date']


# ACTOR-MOVIE LINK
class CastMovieSerializer(serializers.ModelSerializer):
    actor = ActorSerializer()

    class Meta:
        model = CastMovie
        fields = ['id', 'actor', 'role_name']


# GENRE
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


# IMAGES
class MovieImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieImage
        fields = ['id', 'image_url']


# MOVIE-GENRE LINK
class MovieGenreSerializer(serializers.ModelSerializer):
    genre = GenreSerializer()

    class Meta:
        model = MovieGenre
        fields = ['id', 'genre']


# MOVIE (READ FROM DATABASE)
class MovieSerializer(serializers.ModelSerializer):
    images = MovieImageSerializer(source='movieimage_set', many=True, read_only=True)
    genres = MovieGenreSerializer(source='moviegenre_set', many=True, read_only=True)
    cast = CastMovieSerializer(source='castmovie_set', many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'release_year',
            'duration',
            'images',
            'genres',
            'cast'
        ]


# MOVIE (CREATE)
class MovieCreateSerializer(serializers.ModelSerializer):
    genres = serializers.ListField(child=serializers.CharField(), write_only=True)
    images = serializers.ListField(child=serializers.URLField(), write_only=True)
    cast = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Movie
        fields = [
            'title',
            'description',
            'release_year',
            'duration',
            'genres',
            'images',
            'cast'
        ]

    def create(self, validated_data):
        genres_data = validated_data.pop('genres')
        images_data = validated_data.pop('images')
        cast_data = validated_data.pop('cast')

        # creating movie
        movie = Movie.objects.create(**validated_data)

        # adding genres
        for genre_name in genres_data:
            genre, _ = Genre.objects.get_or_create(name=genre_name)
            MovieGenre.objects.create(movie=movie, genre=genre)

        # adding images
        for img in images_data:
            MovieImage.objects.create(movie=movie, image_url=img)

        # adding cast
        for actor_data in cast_data:
            actor, _ = Actor.objects.get_or_create(name=actor_data['name'])
            CastMovie.objects.create(
                movie=movie,
                actor=actor,
                role_name=actor_data.get('role', '')
            )
            
        return movie

# REVIEW
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'text', 'movie', 'user']


# RATING
class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'value', 'movie', 'user']