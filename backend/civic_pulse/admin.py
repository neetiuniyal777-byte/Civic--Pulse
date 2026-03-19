from django.contrib import admin
from .models import User, Post

# Register your models here.
admin.site.register(User)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'title', 'author', 'category', 'city', 'municipal_body', 'status', 'is_petition', 'action_timeline_days', 'created_at')
    list_editable = ('status', 'action_timeline_days', 'is_petition')
    list_filter = ('category', 'status', 'is_petition', 'city', 'state', 'municipal_body', 'created_at')
    search_fields = ('case_id', 'title', 'description', 'address', 'city', 'state', 'municipal_body')
    readonly_fields = ('case_id', 'latitude', 'longitude')
