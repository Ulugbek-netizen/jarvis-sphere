import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from hermes_bridge import response_text

class BridgeTests(unittest.TestCase):
    def test_provider_failure_is_not_a_successful_answer(self):
        for result in [{"failed": True, "final_response": "HTTP 429 provider unavailable"}, {"error": "bad", "final_response": "text"}, {"interrupted": True}, {"final_response": ""}, {}]:
            with self.assertRaises(RuntimeError):
                response_text(result)
        self.assertEqual(response_text({"failed": False, "final_response": "Сайн байна уу"}), "Сайн байна уу")

if __name__ == "__main__":
    unittest.main()
