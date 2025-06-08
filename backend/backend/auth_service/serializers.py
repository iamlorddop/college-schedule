from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.core.exceptions import ValidationError

User = get_user_model()

def snake_to_camel(snake_str):
    """Convert snake_case to lowerCamelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(word.capitalize() for word in components[1:])

def camel_to_snake(camel_str):
    """Convert lowerCamelCase to snake_case"""
    result = []
    for i, char in enumerate(camel_str):
        if char.isupper() and i > 0:
            result.append('_')
        result.append(char.lower())
    return ''.join(result)

class CamelCaseSerializerMixin:
    """Mixin to convert field names between snake_case and camelCase"""
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert keys to camelCase
        camel_case_data = {}
        for key, value in data.items():
            camel_key = snake_to_camel(key)
            # Convert role to lowercase if it's the role field
            if key == 'role' and isinstance(value, str):
                value = value.lower()
            camel_case_data[camel_key] = value
        return camel_case_data
    
    def to_internal_value(self, data):
        # Convert camelCase keys back to snake_case for internal processing
        snake_case_data = {}
        for key, value in data.items():
            snake_key = camel_to_snake(key)
            snake_case_data[snake_key] = value
        return super().to_internal_value(snake_case_data)

class UserSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    role = serializers.CharField(source='get_role_display', read_only=True) if hasattr(User, 'get_role_display') else serializers.CharField(read_only=True)
    teacher_id = serializers.IntegerField(required=False, allow_null=True)
    group_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'middle_name', 'role', 'teacher_id', 'group_id']
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super(CamelCaseSerializerMixin, self).to_representation(instance)
        # Удаляем teacher_id и group_id, если их нет в модели
        if not hasattr(instance, 'teacher_id'):
            data.pop('teacher_id', None)
        if not hasattr(instance, 'group_id'):
            data.pop('group_id', None)
        
        # Apply camelCase conversion and role lowercase
        camel_case_data = {}
        for key, value in data.items():
            camel_key = snake_to_camel(key)
            # Convert role to lowercase if it's the role field
            if key == 'role' and isinstance(value, str):
                value = value.lower()
            camel_case_data[camel_key] = value
        return camel_case_data

class RegisterSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
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

class ChangeOwnPasswordSerializer(CamelCaseSerializerMixin, serializers.Serializer):
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