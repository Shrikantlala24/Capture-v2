
import os
import time
from collections import defaultdict
from typing import Dict, Any, Optional

class LLMManager:
    def __init__(self):
        self.model_configs = {
            "gemini-2.5-flash": {
                "rpm": 2, "tpm": 36350, "rpd": 5, "priority": 2
            },
            "gemini-2.5-flash-lite": {
                "rpm": 9, "tpm": 72010, "rpd": 20, "priority": 3
            },
            "gemini-3-flash": {
                "rpm": 4, "tpm": 30690, "rpd": 7, "priority": 1
            },
            "gemini-3.1-flash-lite": {
                "rpm": 0, "tpm": 0, "rpd": 0, "priority": 99 # Not usable with 0 limits
            }
        }
        self.current_minute = int(time.time() // 60)
        self.current_day = int(time.time() // (24 * 3600))
        self.usage_metrics = defaultdict(lambda: {"rpm_count": 0, "tpm_count": 0, "rpd_count": 0})

        # Load API keys from environment variables
        self.api_keys: Dict[str, str] = {
            "gemini-2.5-flash": os.getenv("GEMINI_2_5_FLASH_API_KEY", "YOUR_GEMINI_2_5_FLASH_API_KEY"),
            "gemini-2.5-flash-lite": os.getenv("GEMINI_2_5_FLASH_LITE_API_KEY", "YOUR_GEMINI_2_5_FLASH_LITE_API_KEY"),
            "gemini-3-flash": os.getenv("GEMINI_3_FLASH_API_KEY", "YOUR_GEMINI_3_FLASH_API_KEY"),
            "gemini-3.1-flash-lite": os.getenv("GEMINI_3_1_FLASH_LITE_API_KEY", "YOUR_GEMINI_3_1_FLASH_LITE_API_KEY"),
        }

    def _update_time_metrics(self):
        new_minute = int(time.time() // 60)
        new_day = int(time.time() // (24 * 3600))

        if new_minute > self.current_minute:
            # Reset minute-based counts for all models
            for model_name in self.usage_metrics:
                self.usage_metrics[model_name]["rpm_count"] = 0
                self.usage_metrics[model_name]["tpm_count"] = 0
            self.current_minute = new_minute

        if new_day > self.current_day:
            # Reset daily counts for all models
            for model_name in self.usage_metrics:
                self.usage_metrics[model_name]["rpd_count"] = 0
            self.current_day = new_day

    def get_model(self, requested_tokens: int = 1) -> Optional[Dict[str, Any]]:
        self._update_time_metrics()

        available_models = []
        for model_name, config in self.model_configs.items():
            if config["rpm"] == 0 and config["tpm"] == 0 and config["rpd"] == 0:
                continue # Skip models with zero limits

            current_usage = self.usage_metrics[model_name]

            # Check RPM limit
            rpm_available = current_usage["rpm_count"] < config["rpm"]
            # Check TPM limit
            tpm_available = (current_usage["tpm_count"] + requested_tokens) <= config["tpm"]
            # Check RPD limit
            rpd_available = current_usage["rpd_count"] < config["rpd"]

            if rpm_available and tpm_available and rpd_available:
                available_models.append((config["priority"], model_name, config))

        if not available_models:
            print("No models available within current rate limits.")
            return None

        # Sort by priority (lower number is higher priority)
        available_models.sort(key=lambda x: x[0])

        best_model_name = available_models[0][1]
        best_model_config = available_models[0][2]
        api_key = self.api_keys.get(best_model_name)

        return {
            "name": best_model_name,
            "api_key": api_key,
            "config": best_model_config
        }

    def update_usage(self, model_name: str, tokens_used: int = 0):
        self._update_time_metrics()
        if model_name in self.usage_metrics:
            self.usage_metrics[model_name]["rpm_count"] += 1
            self.usage_metrics[model_name]["tpm_count"] += tokens_used
            self.usage_metrics[model_name]["rpd_count"] += 1
        else:
            print(f"Warning: Usage updated for unknown model: {model_name}")

# Example Usage (for testing purposes, remove in production if not needed)
if __name__ == "__main__":
    # Set dummy API keys for demonstration
    os.environ["GEMINI_2_5_FLASH_API_KEY"] = "sk-example-2-5-flash"
    os.environ["GEMINI_2_5_FLASH_LITE_API_KEY"] = "sk-example-2-5-flash-lite"
    os.environ["GEMINI_3_FLASH_API_KEY"] = "sk-example-3-flash"
    os.environ["GEMINI_3_1_FLASH_LITE_API_KEY"] = "sk-example-3-1-flash-lite"

    manager = LLMManager()

    print("--- Initial Model Selection ---")
    model_info = manager.get_model(requested_tokens=100)
    if model_info:
        print(f"Selected Model: {model_info['name']}")
        manager.update_usage(model_info['name'], tokens_used=100)
    else:
        print("No model selected.")

    print("
--- Simulate Multiple Requests to Hit RPM for Gemini 3 Flash ---")
    for _ in range(5): # Gemini 3 Flash has RPM of 4, so 5th request should hit limit
        model_info = manager.get_model(requested_tokens=50)
        if model_info:
            print(f"Selected Model: {model_info['name']}")
            manager.update_usage(model_info['name'], tokens_used=50)
        else:
            print("No model selected.")
        time.sleep(0.1) # Simulate some delay

    print("
--- After hitting Gemini 3 Flash RPM, trying again ---")
    model_info = manager.get_model(requested_tokens=50)
    if model_info:
        print(f"Selected Model: {model_info['name']}")
        manager.update_usage(model_info['name'], tokens_used=50)
    else:
        print("No model selected.")

    # Simulate passing a minute to reset RPM/TPM
    print("\n--- Simulating 1 minute pass ---")
    manager.current_minute += 1
    model_info = manager.get_model(requested_tokens=50)
    if model_info:
        print(f"Selected Model: {model_info['name']}")
        manager.update_usage(model_info['name'], tokens_used=50)
    else:
        print("No model selected.")

    print("\n--- Current Usage Metrics ---")
    for model_name, metrics in manager.usage_metrics.items():
        print(f"  {model_name}: RPM={metrics['rpm_count']}, TPM={metrics['tpm_count']}, RPD={metrics['rpd_count']}")
