import os
import base64
import requests
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeRequest(BaseModel):
    ingredients: List[str]
    theme: str = "간단 요리"
    exclude_ingredients: List[str] = [] # 못 먹는 재료 추가

@app.post("/api/analyze")
async def analyze_fridge(file: UploadFile = File(...)):
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API Key not found")

    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/gemini-cli",
                "X-Title": "Fridge Recipe App"
            },
            data=json.dumps({
                "model": "google/gemma-3-27b-it:free",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text", 
                                "text": "이미지 속의 모든 식재료를 찾아줘. 결과는 쉼표(,)로 구분된 한국어 단어 목록으로만 대답해줘. (예: 양파, 달걀, 우유)"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{file.content_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ]
            })
        )

        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            ingredients = [item.strip() for item in content.split(',') if item.strip()]
            return {"ingredients": ingredients}
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to analyze image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recipe")
async def get_recipe(request: RecipeRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API Key not found")

    try:
        ingredients_str = ", ".join(request.ingredients)
        exclude_str = ", ".join(request.exclude_ingredients) if request.exclude_ingredients else "없음"
        
        prompt = f"""너는 세계 최고의 셰프야. 다음 재료들을 활용해서 '{request.theme}' 테마의 요리 레시피를 1개 추천해줘.
        
사용 가능한 재료: {ingredients_str}
사용자가 먹지 못하는 재료(절대 포함 금지): {exclude_str}

응답은 반드시 아래 JSON 형식으로만 해줘. 다른 설명은 하지 마:
{{
  "title": "요리 이름",
  "description": "요리에 대한 짧은 설명",
  "time": "소요 시간 (예: 20분)",
  "difficulty": "난이도 (초급/중급/고급)",
  "ingredients": ["정확한 계량이 포함된 재료 목록"],
  "steps": ["단계별 조리법 1", "단계별 조리법 2", ...]
}}"""

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/gemini-cli",
                "X-Title": "Fridge Recipe App"
            },
            data=json.dumps({
                "model": "qwen/qwen3.6-plus:free",
                "messages": [
                    {"role": "system", "content": "너는 레시피를 JSON 형식으로 제공하는 전문 요리사야."},
                    {"role": "user", "content": prompt}
                ]
            })
        )

        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            recipe_data = json.loads(content)
            return recipe_data
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to generate recipe")
    except Exception as e:
        print(f"Recipe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
