
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.generics import UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, ChangeOwnPasswordSerializer
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                "user": user_data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Добавляем данные пользователя
        user_data = UserSerializer(self.user).data
        data.update({"user": user_data})
        
        return data

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Только админ может видеть список пользователей
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserPasswordChangeView(UpdateAPIView):
    serializer_class = ChangeOwnPasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs.get('id')
        request_user = self.request.user

        if user_id is None:
            # Меняем свой пароль
            return request_user
        else:
            # Меняем чужой пароль — только для суперадмина
            if not request_user.is_superuser:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only superuser can change other users' passwords.")
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                from rest_framework.exceptions import NotFound
                raise NotFound("User not found.")
            return user

    def perform_update(self, serializer):
        user = self.get_object()
        logger.info(f"User {self.request.user.username} changed password for user {user.username}")
        serializer.save()

    def update(self, request, *args, **kwargs):
        # Для смены чужого пароля не требуется старый пароль
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)