import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from bot.aliexpress_client import DryRunAliExpress  # noqa: E402
from bot.etsy_client import FakeEtsyClient  # noqa: E402
from bot.processor import process_receipts  # noqa: E402
from bot.store import Store  # noqa: E402

MAPPING = {"111": {"product_id": "AE-1", "sku": "red-L"}}


def receipt(rid=1, listing=111, **over):
    r = {
        "receipt_id": rid,
        "name": "Jean Dupont",
        "first_line": "12 rue des Lilas",
        "second_line": "Apt 4",
        "city": "Lyon",
        "state": "",
        "zip": "69003",
        "country_iso": "FR",
        "transactions": [{"listing_id": listing, "quantity": 2}],
    }
    r.update(over)
    return r


class FlowTest(unittest.TestCase):
    def run_flow(self, receipts):
        ali, store = DryRunAliExpress(), Store(":memory:")
        stats = process_receipts(FakeEtsyClient(receipts), ali, store, MAPPING, "+33600000000")
        return stats, ali, store

    def test_address_is_forwarded(self):
        stats, ali, _ = self.run_flow([receipt()])
        self.assertEqual(stats["ordered"], 1)
        sent = ali.sent[0]
        self.assertEqual(sent["shipping_address"]["city"], "Lyon")
        self.assertEqual(sent["shipping_address"]["line1"], "12 rue des Lilas")
        self.assertEqual(sent["shipping_address"]["phone"], "+33600000000")
        self.assertEqual(sent["items"][0], {"ali_product_id": "AE-1", "ali_sku": "red-L", "quantity": 2})

    def test_no_duplicate_order(self):
        ali, store = DryRunAliExpress(), Store(":memory:")
        etsy = FakeEtsyClient([receipt()])
        process_receipts(etsy, ali, store, MAPPING, "x")
        stats = process_receipts(etsy, ali, store, MAPPING, "x")
        self.assertEqual(len(ali.sent), 1)
        self.assertEqual(stats["skipped"], 1)

    def test_unmapped_listing_goes_manual(self):
        stats, ali, store = self.run_flow([receipt(listing=999)])
        self.assertEqual(stats["manual"], 1)
        self.assertEqual(ali.sent, [])
        self.assertEqual(store.all()[0][1], "needs_manual")

    def test_incomplete_address_goes_manual(self):
        stats, ali, _ = self.run_flow([receipt(zip="")])
        self.assertEqual(stats["manual"], 1)
        self.assertEqual(ali.sent, [])


if __name__ == "__main__":
    unittest.main()
