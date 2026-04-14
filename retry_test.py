import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_api_call(model, messages):
    print(f"\n--- Testing Model: {model} ---")
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/gemini-cli", # OpenRouter 필수/권장 헤더
                "X-Title": "Gemini CLI Test"
            },
            data=json.dumps({
                "model": model,
                "messages": messages
            })
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print(f"Success! Response:\n{content}")
            return True
        else:
            print(f"Error ({model}): {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Exception during {model} test: {e}")
        return False

if __name__ == "__main__":
    if not api_key:
        print("API Key not found in .env file!")
    else:
        # 1. 텍스트 테스트 (qwen/qwen3.6-plus:free)
        text_model = "qwen/qwen3.6-plus:free"
        text_prompt = "안녕하세요, 간단하게 자기소개 부탁드립니다."
        test_api_call(text_model, [{"role": "user", "content": text_prompt}])
        
        # 2. 잠시 대기 (Rate Limit 방지)
        print("\nWaiting 10 seconds for the next request...")
        time.sleep(10)
        
        # 3. 이미지 테스트 (google/gemma-3-27b-it:free)
        vision_model = "google/gemma-3-27b-it:free"
        vision_prompt = "이 이미지에서 무엇을 볼 수 있나요? (한국어로 답변)"
        image_url = "https://raw.githubusercontent.com/otter-ai/Otter/main/assets/demo.png" # 더 범용적인 테스트 이미지
        
        vision_messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": vision_prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ]
        test_api_call(vision_model, vision_messages)
