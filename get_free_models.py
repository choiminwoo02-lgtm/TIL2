import requests

def list_all_free_models():
    print("--- Fetching Current Free Models from OpenRouter ---")
    try:
        response = requests.get("https://openrouter.ai/api/v1/models")
        if response.status_code == 200:
            models = response.json().get('data', [])
            # ID에 'free'가 포함된 모델 필터링
            free_models = [m['id'] for m in models if ':free' in m['id']]
            if not free_models:
                print("No models with ':free' suffix found. Listing all IDs containing 'free':")
                free_models = [m['id'] for m in models if 'free' in m['id'].lower()]
            
            for m in free_models:
                print(f"- {m}")
            return free_models
        else:
            print(f"Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception: {e}")
        return []

if __name__ == "__main__":
    list_all_free_models()
