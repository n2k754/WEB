import base64
import hashlib
import os
import sys
import unittest
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from bot.oauth import REDIRECT_URI, build_auth_url, make_pkce  # noqa: E402


class OAuthTest(unittest.TestCase):
    def test_pkce_challenge_matches_verifier(self):
        v, c = make_pkce()
        expected = base64.urlsafe_b64encode(hashlib.sha256(v.encode()).digest()).rstrip(b"=").decode()
        self.assertEqual(c, expected)
        self.assertNotIn("=", v)

    def test_auth_url(self):
        url = build_auth_url("KEY", "st", "ch")
        q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
        self.assertEqual(q["redirect_uri"], [REDIRECT_URI])
        self.assertEqual(q["code_challenge_method"], ["S256"])
        self.assertEqual(q["client_id"], ["KEY"])
        self.assertEqual(REDIRECT_URI, "http://localhost:3003/callback")


if __name__ == "__main__":
    unittest.main()
