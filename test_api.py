import os
import requests
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_text_generation():
    print("\n--- Testing Text Generation (qwen/qwen-plus:free) ---")
    # qwen/qwen-plus:free 또는 유사한 모델 확인 필요 (사용자가 요청한 qwen/qwen3.6-plus:free는 현재 OpenRouter에 없을 수 있음)
    model = "qwen/qwen-plus:free" 
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello, can you introduce yourself briefly in Korean?"}
            ]
        })
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Response:", result['choices'][0]['message']['content'])
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def test_image_recognition():
    print("\n--- Testing Image Recognition (google/gemma-3-27b-it:free) ---")
    model = "google/gemma-3-27b-it:free"
    
    # 샘플 이미지 URL (구글 로고)
    image_url = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What is in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ]
        })
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Response:", result['choices'][0]['message']['content'])
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    if not api_key:
        print("API Key not found in .env file!")
    else:
        test_text_generation()
        test_image_recognition()
