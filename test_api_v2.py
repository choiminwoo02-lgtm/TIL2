import os
import requests
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_text_generation():
    print("\n--- Testing Text Generation (qwen/qwen-2-7b-instruct:free) ---")
    # 현재 가장 확실하게 지원되는 무료 Qwen 모델
    model = "qwen/qwen-2-7b-instruct:free" 
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": model,
            "messages": [
                {"role": "user", "content": "안녕하세요, 간단한 자기소개 부탁드려요."}
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
    print("\n--- Testing Image Recognition (google/gemini-2.0-flash-exp:free) ---")
    # 비전이 가능한 현재 가장 안정적인 무료 모델
    model = "google/gemini-2.0-flash-exp:free"
    
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
                        {"type": "text", "text": "이 이미지에 무엇이 보이나요? 한국어로 대답해주세요."},
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
