import streamlit as st
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from knowledge_base import KNOWLEDGE_BASE

# 설정 로드
load_dotenv()

# 샘플 문제 데이터 (API Key 없을 때 대비)
SAMPLE_QUESTIONS = {
    "1주차: 바이브 코딩 입문": [
        {
            "question": "자연어로 AI와 대화하며 코드를 생성하고 소프트웨어를 만드는 방식을 무엇이라고 하나요?",
            "options": ["바이브 코딩", "하드 코딩", "로우 코딩", "블록 코딩"],
            "answer": 0,
            "explanation": "바이브 코딩(Vibe Coding)은 안드레 파시가 언급한 용어로, 자연어로 AI와 소통하며 개발하는 새로운 방식을 뜻합니다."
        }
    ],
    "3주차: 클로드 코드 실습": [
        {
            "question": "클로드 코드(Claude Code)를 설치하기 위해 필수적으로 필요한 도구 두 가지는 무엇인가요?",
            "options": ["Python, Java", "Node.js, Git", "Docker, Kubernetes", "C++, C#"],
            "answer": 1,
            "explanation": "클로드 코드는 Node.js 환경에서 실행되며 프로젝트 관리를 위해 Git이 필수입니다."
        }
    ],
    "5주차: 할루시네이션과 검증": [
        {
            "question": "AI가 사실과 다른 정보를 마치 진짜인 것처럼 답변하는 현상을 무엇이라고 하나요?",
            "options": ["데이터 누수", "할루시네이션(환각)", "오버피팅", "제로샷"],
            "answer": 1,
            "explanation": "할루시네이션(Hallucination)은 생성형 AI의 주요 한계점 중 하나로, 사실 여부 확인이 반드시 필요합니다."
        }
    ]
}

# 페이지 설정
st.set_page_config(page_title="바이브 코딩 마스터 퀴즈", page_icon="🎓", layout="centered")

# 세션 상태 초기화
if "quiz_data" not in st.session_state:
    st.session_state.quiz_data = []
if "current_q" not in st.session_state:
    st.session_state.current_q = 0
if "score" not in st.session_state:
    st.session_state.score = 0
if "submitted" not in st.session_state:
    st.session_state.submitted = False
if "quiz_started" not in st.session_state:
    st.session_state.quiz_started = False

def init_gemini(api_key):
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        return None

def generate_questions(model, week_topic, content, count=3):
    prompt = f"""
    다음 내용을 바탕으로 객관식(4지선다) 문제 {count}개를 생성해주세요.
    JSON 형식으로 응답: 'question', 'options', 'answer'(0-3), 'explanation'.
    [내용]: {content}
    """
    try:
        response = model.generate_content(prompt)
        json_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(json_text)
    except:
        return SAMPLE_QUESTIONS.get(week_topic, SAMPLE_QUESTIONS["1주차: 바이브 코딩 입문"])

# UI
st.title("🎓 바이브 코딩 마스터 퀴즈")

# 사이드바
st.sidebar.header("🛠️ 설정")
api_key = st.sidebar.text_input("Gemini API Key (선택사항)", type="password", value=os.getenv("GOOGLE_API_KEY", ""))
selected_week = st.sidebar.selectbox("학습 주차 선택", list(KNOWLEDGE_BASE.keys()))

if st.sidebar.button("🚀 퀴즈 시작"):
    if api_key and api_key != "your_gemini_api_key_here":
        model = init_gemini(api_key)
        with st.spinner("AI가 새로운 문제를 생성 중입니다..."):
            st.session_state.quiz_data = generate_questions(model, selected_week, KNOWLEDGE_BASE[selected_week])
    else:
        st.session_state.quiz_data = SAMPLE_QUESTIONS.get(selected_week, SAMPLE_QUESTIONS["1주차: 바이브 코딩 입문"])
        st.sidebar.info("API Key가 없어 샘플 문제로 진행합니다.")
    
    st.session_state.current_q = 0
    st.session_state.score = 0
    st.session_state.submitted = False
    st.session_state.quiz_started = True
    st.rerun()

# 퀴즈 화면
if st.session_state.quiz_started and st.session_state.quiz_data:
    q_data = st.session_state.quiz_data[st.session_state.current_q]
    st.subheader(f"Q{st.session_state.current_q + 1}. {q_data['question']}")
    
    user_choice = st.radio("정답 선택:", q_data['options'], key=f"q_{st.session_state.current_q}")
    
    if not st.session_state.submitted:
        if st.button("✅ 정답 확인"):
            st.session_state.submitted = True
            st.rerun()
    else:
        if user_choice == q_data['options'][q_data['answer']]:
            st.success("🎯 정답입니다!")
            if f"scored_{st.session_state.current_q}" not in st.session_state:
                st.session_state.score += 1
                st.session_state[f"scored_{st.session_state.current_q}"] = True
        else:
            st.error(f"❌ 오답입니다. (정답: {q_data['options'][q_data['answer']]})")
        
        st.info(f"💡 **해설:** {q_data['explanation']}")
        
        if st.session_state.current_q < len(st.session_state.quiz_data) - 1:
            if st.button("다음 문제 ➡️"):
                st.session_state.current_q += 1
                st.session_state.submitted = False
                st.rerun()
        else:
            st.balloons()
            st.header(f"🏁 완료! 점수: {st.session_state.score} / {len(st.session_state.quiz_data)}")
            if st.button("다시 하기"):
                st.session_state.quiz_started = False
                st.rerun()
else:
    st.info("왼쪽 사이드바에서 주차를 선택하고 **'🚀 퀴즈 시작'** 버튼을 눌러주세요!")
    st.image("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")
