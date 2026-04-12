"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from stud_accs.views import RegisterView, HomeView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/register/",RegisterView.as_view(), name = 'user_registration'),
    path('api/login/',TokenObtainPairView.as_view(), name = 'get-token'),
    path('api/token/refresh/',TokenRefreshView.as_view(), name = 'token-refresh'),
    path('home/',HomeView.as_view(),name='home'),
    path("logout/",LogoutView.as_view(),name='logout')

]
