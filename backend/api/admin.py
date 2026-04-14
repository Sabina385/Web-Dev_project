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

admin.site.register(Movie, MovieAdmin)
# admin.site.register(Movie)
admin.site.register(Genre)
admin.site.register(MovieGenre)
admin.site.register(MovieImage)
admin.site.register(Review)
admin.site.register(Rating)