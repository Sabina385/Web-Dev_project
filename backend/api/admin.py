from django.contrib import admin
from .models import *

# info to enter like admin. all in lowercase
# login: admin
# password: superuser

class MovieImageInline(admin.TabularInline):
    model = MovieImage
    extra = 1

class MovieGenreInline(admin.TabularInline):
    model = MovieGenre
    extra = 1

class CastMovieInline(admin.TabularInline):
    model = CastMovie
    extra = 1

class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_year', 'duration')

    inlines = [
        MovieImageInline,
        MovieGenreInline,
        CastMovieInline
    ]

@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('name', 'birth_date')
    search_fields = ('name',)
    
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'user')
    search_fields = ('movie__title', 'user__username') 
    
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'user', 'value')
    search_fields = ('movie__title', 'user__username')
    
@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'user')


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user', 'movie')    
       

admin.site.register(Movie, MovieAdmin)
# admin.site.register(Movie)
admin.site.register(Genre)
admin.site.register(MovieGenre)
admin.site.register(MovieImage)