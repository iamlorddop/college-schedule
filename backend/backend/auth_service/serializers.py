
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='get_role_display', read_only=True) if hasattr(User, 'get_role_display') else serializers.CharField(read_only=True)
    teacher_id = serializers.IntegerField(required=False, allow_null=True)
    group_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'middle_name', 'role', 'teacher_id', 'group_id']
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Удаляем teacher_id и group_id, если их нет в модели
        if not hasattr(instance, 'teacher_id'):
            data.pop('teacher_id', None)
        if not hasattr(instance, 'group_id'):
            data.pop('group_id', None)
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()
    teacher_id = serializers.IntegerField(required=False, allow_null=True)
    group_id = serializers.IntegerField(required=False, allow_null=True)

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
        # Удаляем teacher_id и group_id, если их нет в модели
        if not hasattr(User, 'teacher_id'):
            validated_data.pop('teacher_id', None)
        if not hasattr(User, 'group_id'):
            validated_data.pop('group_id', None)
        return User.objects.create(**validated_data)

class ChangeOwnPasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Старый пароль неверен")
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        try:
            validate_password(value, user)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance