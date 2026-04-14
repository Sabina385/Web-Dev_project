from django.contrib import admin
from .models import *

# info to enter like admin. all in lowercase
# login: admin
# password: superuser

admin.site.register(Movie)
admin.site.register(Genre)
admin.site.register(MovieGenre)
admin.site.register(MovieImage)
admin.site.register(Review)
admin.site.register(Rating)