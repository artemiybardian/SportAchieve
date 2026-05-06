import json
import pytest
from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

REGISTER_URL = '/api/auth/register'
LOGIN_URL = '/api/auth/login'
ME_URL = '/api/auth/me'
ONBOARDING_COMPLETE_URL = '/api/onboarding/complete'


@pytest.fixture
def client():
    return Client()


@pytest.mark.django_db
class TestRegister:
    def test_register_returns_token(self, client):
        resp = client.post(
            REGISTER_URL,
            data=json.dumps({'email': 'new@example.com', 'password': 'securepass123'}),
            content_type='application/json',
        )
        assert resp.status_code == 200
        data = resp.json()
        assert 'token' in data
        assert len(data['token']) > 10

    def test_register_creates_user(self, client):
        client.post(
            REGISTER_URL,
            data=json.dumps({'email': 'user2@example.com', 'password': 'pass1234'}),
            content_type='application/json',
        )
        assert User.objects.filter(email='user2@example.com').exists()

    def test_register_duplicate_email_returns_400(self, client):
        payload = json.dumps({'email': 'dup@example.com', 'password': 'pass1234'})
        client.post(REGISTER_URL, data=payload, content_type='application/json')
        resp = client.post(REGISTER_URL, data=payload, content_type='application/json')
        assert resp.status_code == 400
        assert 'already exists' in resp.json().get('message', '')

    def test_register_with_name(self, client):
        resp = client.post(
            REGISTER_URL,
            data=json.dumps({'email': 'named@example.com', 'password': 'pass', 'first_name': 'Иван', 'last_name': 'Иванов'}),
            content_type='application/json',
        )
        assert resp.status_code == 200
        user = User.objects.get(email='named@example.com')
        assert user.first_name == 'Иван'
        assert user.last_name == 'Иванов'


@pytest.mark.django_db
class TestLogin:
    def _register(self, client, email='login@example.com', password='testpass'):
        client.post(
            REGISTER_URL,
            data=json.dumps({'email': email, 'password': password}),
            content_type='application/json',
        )

    def test_login_returns_token(self, client):
        self._register(client)
        resp = client.post(
            LOGIN_URL,
            data=json.dumps({'email': 'login@example.com', 'password': 'testpass'}),
            content_type='application/json',
        )
        assert resp.status_code == 200
        assert 'token' in resp.json()

    def test_login_wrong_password_returns_401(self, client):
        self._register(client)
        resp = client.post(
            LOGIN_URL,
            data=json.dumps({'email': 'login@example.com', 'password': 'wrongpassword'}),
            content_type='application/json',
        )
        assert resp.status_code == 401

    def test_login_unknown_email_returns_401(self, client):
        resp = client.post(
            LOGIN_URL,
            data=json.dumps({'email': 'nobody@example.com', 'password': 'whatever'}),
            content_type='application/json',
        )
        assert resp.status_code == 401


@pytest.mark.django_db
class TestMe:
    def _get_token(self, client):
        client.post(
            REGISTER_URL,
            data=json.dumps({'email': 'me@example.com', 'password': 'mypassword'}),
            content_type='application/json',
        )
        resp = client.post(
            LOGIN_URL,
            data=json.dumps({'email': 'me@example.com', 'password': 'mypassword'}),
            content_type='application/json',
        )
        return resp.json()['token']

    def test_me_returns_user_data(self, client):
        token = self._get_token(client)
        resp = client.get(ME_URL, HTTP_AUTHORIZATION=f'Bearer {token}')
        assert resp.status_code == 200
        data = resp.json()
        assert data['email'] == 'me@example.com'
        assert 'id' in data
        assert data.get('is_onboarding_complete') is False

    def test_me_without_token_returns_401(self, client):
        resp = client.get(ME_URL)
        assert resp.status_code == 401


@pytest.mark.django_db
class TestOnboardingComplete:
    def _register_and_token(self, client):
        client.post(
            REGISTER_URL,
            data=json.dumps({'email': 'onb@example.com', 'password': 'mypassword'}),
            content_type='application/json',
        )
        resp = client.post(
            LOGIN_URL,
            data=json.dumps({'email': 'onb@example.com', 'password': 'mypassword'}),
            content_type='application/json',
        )
        return resp.json()['token']

    def test_complete_onboarding_sets_flag_and_returns_200(self, client):
        token = self._register_and_token(client)
        resp = client.post(ONBOARDING_COMPLETE_URL, HTTP_AUTHORIZATION=f'Bearer {token}')
        assert resp.status_code == 200
        me = client.get(ME_URL, HTTP_AUTHORIZATION=f'Bearer {token}').json()
        assert me['is_onboarding_complete'] is True

    def test_complete_onboarding_idempotent(self, client):
        token = self._register_and_token(client)
        client.post(ONBOARDING_COMPLETE_URL, HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = client.post(ONBOARDING_COMPLETE_URL, HTTP_AUTHORIZATION=f'Bearer {token}')
        assert resp.status_code == 200


@pytest.mark.django_db
class TestUserService:
    def test_register_hashes_password(self):
        from api.services.UserService import UserService
        svc = UserService()
        user = svc.register(email='hash@example.com', password='plaintext')
        assert user.password != 'plaintext'
        assert user.password.startswith('pbkdf2')

    def test_login_returns_none_on_bad_password(self):
        from api.services.UserService import UserService
        svc = UserService()
        svc.register(email='bad@example.com', password='correct')
        result = svc.login_by_email('bad@example.com', 'wrong')
        assert result is None

    def test_login_returns_user_on_correct_password(self):
        from api.services.UserService import UserService
        svc = UserService()
        svc.register(email='good@example.com', password='correct')
        result = svc.login_by_email('good@example.com', 'correct')
        assert result is not None
        assert result.email == 'good@example.com'
