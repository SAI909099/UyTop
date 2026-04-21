from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.interactions.models import VisitorSession


User = get_user_model()


class PresenceApiTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user-presence@example.com",
            phone_number="+998901111111",
            password="StrongPass123",
            role="user",
            first_name="User",
            last_name="Presence",
        )
        self.admin = User.objects.create_user(
            email="admin-presence@example.com",
            phone_number="+998902222222",
            password="StrongPass123",
            role="admin",
            is_staff=True,
            first_name="Admin",
            last_name="Presence",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_guest_heartbeat_creates_guest_session(self):
        response = self.client.post(
            "/api/presence/heartbeat",
            {
                "session_key": "guest-session-1",
                "current_path": "/en/projects",
            },
            format="json",
            HTTP_X_UYTOP_LOCALE="en",
            HTTP_USER_AGENT="pytest-browser",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        visitor_session = VisitorSession.objects.get(session_key="guest-session-1")
        self.assertTrue(visitor_session.is_guest)
        self.assertIsNone(visitor_session.user)
        self.assertEqual(visitor_session.locale, "en")
        self.assertEqual(visitor_session.current_path, "/en/projects")
        self.assertEqual(visitor_session.user_agent, "pytest-browser")

    def test_authenticated_heartbeat_links_registered_user_and_surfaces_in_admin_overview(self):
        self.authenticate(self.user)
        heartbeat_response = self.client.post(
            "/api/presence/heartbeat",
            {
                "session_key": "registered-session-1",
                "current_path": "/uz/map",
            },
            format="json",
            HTTP_X_UYTOP_LOCALE="uz",
        )
        self.assertEqual(heartbeat_response.status_code, status.HTTP_200_OK)

        visitor_session = VisitorSession.objects.get(session_key="registered-session-1")
        self.assertFalse(visitor_session.is_guest)
        self.assertEqual(visitor_session.user, self.user)

        self.authenticate(self.admin)
        overview_response = self.client.get("/api/admin/users/overview?page=1&page_size=10")

        self.assertEqual(overview_response.status_code, status.HTTP_200_OK)
        self.assertEqual(overview_response.data["metrics"]["online_now"], 1)
        self.assertEqual(overview_response.data["metrics"]["registered_accounts"], 2)
        self.assertEqual(overview_response.data["metrics"]["guest_sessions"], 0)
        self.assertEqual(overview_response.data["metrics"]["total_observed_sessions"], 1)
        self.assertEqual(overview_response.data["registered_users"]["page"], 1)

        registered_row = next(
            row for row in overview_response.data["registered_users"]["results"] if row["email"] == self.user.email
        )
        self.assertTrue(registered_row["is_online"])

        online_row = overview_response.data["online_sessions"][0]
        self.assertEqual(online_row["session_type"], "registered")
        self.assertEqual(online_row["email"], self.user.email)
        self.assertEqual(online_row["current_path"], "/uz/map")

    def test_admin_overview_excludes_stale_sessions_from_online_metric(self):
        session = VisitorSession.objects.create(
            session_key="stale-session",
            user=self.user,
            is_guest=False,
            locale="en",
            current_path="/en",
            user_agent="pytest",
        )
        VisitorSession.objects.filter(pk=session.pk).update(last_seen_at=timezone.now() - timedelta(minutes=6))

        self.authenticate(self.admin)
        response = self.client.get("/api/admin/users/overview")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["metrics"]["online_now"], 0)
        registered_row = next(row for row in response.data["registered_users"]["results"] if row["email"] == self.user.email)
        self.assertFalse(registered_row["is_online"])

    def test_admin_overview_requires_admin_role(self):
        self.authenticate(self.user)
        response = self.client.get("/api/admin/users/overview")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
