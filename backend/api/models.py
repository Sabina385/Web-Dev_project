from django.db import models
from django.contrib.auth.models import User

# Genre
# Model for listing genres
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# Movie
# Model for listing movies
class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    release_year = models.IntegerField()
    duration = models.IntegerField(help_text="Duration in minutes", default=0)

    def __str__(self):
        return self.title


# MovieGenre
# Relation between movie and genres
# like one movie can have different genres
class MovieGenre(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)


# MovieImage
# Model for images related to movie
# movie can have one or more images
class MovieImage(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    image_url = models.URLField()


# Actors
class Actor(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


# CastMovie
# Relation between movie and actor
# actors that filmed in movie 
class CastMovie(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    actor = models.ForeignKey(Actor, on_delete=models.CASCADE)
    role_name = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ('movie', 'actor')


# Review
# Model for user's review about specific movie
class Review(models.Model):
    text = models.TextField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


# Rating
# Model of grade that user give to specific movie
class Rating(models.Model):
    value = models.IntegerField()
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
