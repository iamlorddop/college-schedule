from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'teacher_id', 'group_id']
        extra_kwargs = {
            'password': {'write_only': True},
            'teacher_id': {'required': False, 'allow_null': True},
            'group_id': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)