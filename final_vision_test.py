import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

def test_vision():
    model = "google/gemma-3-27b-it:free"
    # 확실히 존재하는 이미지 (위키미디어 공용 - 튤립 이미지)
    image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tulips_at_the_Keukenhof_Gardens.jpg/320px-Tulips_at_the_Keukenhof_Gardens.jpg"
    
    print(f"\n--- Final Vision Test: {model} ---")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/gemini-cli",
            "X-Title": "Gemini CLI Test"
        },
        data=json.dumps({
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이미지에 보이는 꽃의 이름을 알려주세요."},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ]
        })
    )
    
    if response.status_code == 200:
        print("Success! Response:", response.json()['choices'][0]['message']['content'])
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_vision()
