import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def list_free_models():
    print("--- Fetching Free Models from OpenRouter ---")
    response = requests.get("https://openrouter.ai/api/v1/models")
    if response.status_code == 200:
        models = response.json().get('data', [])
        free_models = [m['id'] for m in models if 'free' in m['id']]
        print("\nAvailable Free Models:")
        for m in free_models:
            print(f"- {m}")
        return free_models
    else:
        print(f"Error fetching models: {response.status_code}")
        return []

def test_best_available(free_models):
    # 사용자가 원한 gemma-3 계열이 있는지 확인
    gemma_model = next((m for m in free_models if "gemma" in m and "free" in m), None)
    # qwen 계열이 있는지 확인
    qwen_model = next((m for m in free_models if "qwen" in m and "free" in m), None)
    
    if gemma_model:
        print(f"\nTesting Gemma ({gemma_model})...")
        # 테스트 수행 (이미 시도한 대로)
    
    if qwen_model:
        print(f"\nTesting Qwen ({qwen_model})...")
        # 테스트 수행

if __name__ == "__main__":
    free_models = list_free_models()
    if free_models:
        # 모델 목록을 확인한 후 가장 적절한 모델로 테스트
        pass
