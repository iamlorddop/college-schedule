
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    RegisterAPIView,
    LoginAPIView,
    UserProfileAPIView,
    UserProfileUpdateAPIView,
    UserListView,
    UserPasswordChangeView
)

urlpatterns = [
    # Аутентификация
    path('login/', LoginAPIView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Регистрация и управление пользователями
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('profile/', UserProfileAPIView.as_view(), name='user_profile'),
    path('profile/update/', UserProfileUpdateAPIView.as_view(), name='user_profile_update'),  # <-- добавлено
    path('users/', UserListView.as_view(), name='user_list'),

    # Универсальная смена пароля
    path('users/change-password/', UserPasswordChangeView.as_view(), name='change-own-password'),
    path('users/<int:id>/change-password/', UserPasswordChangeView.as_view(), name='change-user-password'),
]
