from django.shortcuts import render
from .serializers import RegisterSerializer, ExamSerializer, TodoSerializer, StudySessionSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import Exam, Todo, StudySession

# Create your views here.
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class HomeView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self,request):
        content = {'message':"welcome to study buddy, your buddy to help you study!"}
        return Response(content)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status = status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ExamListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Exam.objects.filter(user = self.request.user).order_by('exam_date')

    def perform_create(self,serializer):
        serializer.save(user = self.request.user)

class TodoListCreateView(generics.ListCreateAPIView):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Todo.objects.filter(user = self.request.user)
    def perform_create(self,serializer):
        serializer.save(user = self.request.user)
class TodoListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(user = self.request.user)
class StudySessionView(generics.ListCreateAPIView):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).order_by('-start_time')

    def perform_create(self,serializer):
        serializer.save(user=self.request.user)
        
