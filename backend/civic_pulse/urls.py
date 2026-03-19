from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),

    # Posts CRUD
    path('posts/', views.posts_view, name='posts'),
    path('posts/adopted/', views.adopted_posts_view, name='adopted-posts'),
    path('posts/<int:post_id>/', views.post_detail_view, name='post-detail'),
    path('posts/<int:post_id>/status/', views.post_status_view, name='post-status'),
    path('posts/<int:post_id>/sign/', views.post_sign_view, name='post-sign'),
    path('posts/<int:post_id>/adopt/', views.post_adopt_view, name='post-adopt'),
    
    # Gov Dashboard
    path('gov/dashboard/', views.gov_dashboard_view, name='gov-dashboard'),
]
