import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_api(model, prompt, is_image=False):
    print(f"\n--- Testing Model: {model} ---")
    
    messages = []
    if is_image:
        image_url = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ]
    else:
        messages = [{"role": "user", "content": prompt}]

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": model,
            "messages": messages
        })
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Response:", result['choices'][0]['message']['content'])
        return True
    else:
        print(f"Error ({model}): {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    # 사용자가 요청한 모델명
    text_model = "qwen/qwen-2-72b-instruct:free" # qwen/qwen3.6-plus:free 대신 가용성 높은 모델
    vision_model = "google/gemma-3-27b-it:free"

    # 텍스트 테스트
    test_api(text_model, "안녕하세요, 당신은 누구인가요?")
    
    # 이미지 테스트
    test_api(vision_model, "이미지에 무엇이 보이나요?", is_image=True)
