import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from bot.engine import Engine  # noqa: E402
from bot.feed import FakeFeed  # noqa: E402
from bot.report import report  # noqa: E402
import tempfile  # noqa: E402

NOW = 1_000_000.0


def pool(addr="P1", price=1.0, liq=10000.0, age=60, buyers=20, buys=30, sells=10):
    return {"address": addr, "name": addr, "created_ts": NOW - age, "price": price,
            "liquidity": liq, "buyers_15m": buyers, "sellers_15m": 5, "buys_15m": buys,
            "sells_15m": sells, "dex": "pump-fun"}


class EngineTest(unittest.TestCase):
    def setUp(self):
        self.f = FakeFeed()
        self.e = Engine(self.f, db_path=":memory:")

    def pnl(self):
        return self.e.db.execute("SELECT status,exit_reason,pnl FROM positions").fetchall()

    def test_enters_once(self):
        self.f.new = [pool()]; self.f.state["P1"] = pool()
        self.assertEqual(self.e.tick(NOW)["opened"], 1)
        self.assertEqual(self.e.tick(NOW + 60)["opened"], 0)

    def test_filters_skip(self):
        self.f.new = [pool("A", liq=100), pool("B", buyers=2), pool("C", age=99999),
                      pool("D", buys=5, sells=20)]
        s = self.e.tick(NOW)
        self.assertEqual((s["opened"], s["skipped"]), (0, 4))

    def test_take_profit(self):
        self.f.new = [pool()]; self.f.state["P1"] = pool()
        self.e.tick(NOW)
        self.f.new = []; self.f.state["P1"] = pool(price=1.6)
        self.e.tick(NOW + 60)
        st, reason, pnl = self.pnl()[0]
        self.assertEqual((st, reason), ("closed", "take profit"))
        self.assertGreater(pnl, 0)

    def test_rug_exit_is_a_loss_not_a_save(self):
        self.f.new = [pool()]; self.f.state["P1"] = pool()
        self.e.tick(NOW)
        # liquidité effondrée ET prix effondré au relevé suivant
        self.f.new = []; self.f.state["P1"] = pool(price=0.02, liq=200)
        self.e.tick(NOW + 60)
        st, reason, pnl = self.pnl()[0]
        self.assertEqual(st, "closed")
        self.assertIn("liquidité", reason)
        self.assertLess(pnl, -15)  # perte quasi totale sur 20 $

    def test_vanished_pool_is_total_loss(self):
        self.f.new = [pool()]; self.f.state["P1"] = pool()
        self.e.tick(NOW)
        self.f.new = []; del self.f.state["P1"]
        self.e.tick(NOW + 60); self.e.tick(NOW + 120)
        st, reason, pnl = self.pnl()[0]
        self.assertEqual(st, "closed")
        self.assertAlmostEqual(pnl, -20.0)

    def test_max_hold(self):
        self.f.new = [pool()]; self.f.state["P1"] = pool()
        self.e.tick(NOW)
        self.f.new = []; self.f.state["P1"] = pool(price=1.05)
        self.e.tick(NOW + 4000)
        self.assertEqual(self.pnl()[0][1], "durée maximale")

    def test_report_runs(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "p.db")
            f = FakeFeed(); e = Engine(f, db_path=path)
            f.new = [pool()]; f.state["P1"] = pool(); e.tick(NOW)
            f.new = []; f.state["P1"] = pool(price=1.7); e.tick(NOW + 60)
            e.db.close()
            txt = report(path)
        self.assertIn("Trades clôturés: 1", txt)


if __name__ == "__main__":
    unittest.main()
