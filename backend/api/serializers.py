from django.contrib.auth import models
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Movie, Genre, MovieGenre, MovieImage, Review, Rating, Actor, CastMovie,Watchlist,Recommendation


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
        extra_kwargs = {'password': {'write_only': True}}

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
    rating_avg = serializers.SerializerMethodField()
    #cast = CastMovieSerializer(source='castmovie_set', many=True, read_only=True)

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
            'rating_avg'
            #'cast'
        ]
    def get_rating_avg(self, obj):
        from .models import Rating
        # Считаем среднее по всем оценкам этого фильма
        avg = Rating.objects.filter(movie=obj).aggregate(models.Avg('value'))['value__avg']
        return round(avg, 1) if avg else 0.0    


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
    def update(self, instance, validated_data):
        genres_data = validated_data.pop('genres', [])
        images_data = validated_data.pop('images', [])
        cast_data   = validated_data.pop('cast', [])

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        instance.moviegenre_set.all().delete()
        instance.movieimage_set.all().delete()
        instance.castmovie_set.all().delete()

        for g in genres_data:
            genre, _ = Genre.objects.get_or_create(name=g)
            MovieGenre.objects.create(movie=instance, genre=genre)
        for img in images_data:
            MovieImage.objects.create(movie=instance, image_url=img)
        for a in cast_data:
            actor, _ = Actor.objects.get_or_create(name=a['name'])
            CastMovie.objects.create(movie=instance, actor=actor,role_name=a.get('role', ''))
        return instance

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
        
#WATCHLIST
class WatchlistSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'movie']    
    
#input    
class RecommendationCreateSerializer(serializers.Serializer):
    to_username=serializers.CharField()
    movie_title=serializers.CharField()
    message=serializers.CharField(required=False) 
     
#output   
class RecommendationSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'from_user', 'movie', 'message']    
    
class CastMovieCreateSerializer(serializers.Serializer):
    actor_id = serializers.IntegerField()
    role_name = serializers.CharField(required=False, allow_blank=True)    
                     