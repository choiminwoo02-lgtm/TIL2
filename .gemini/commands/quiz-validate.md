# Quiz Validate Command

## Description
`questions.json` 파일에서 '가장', '최초', '최대'와 같은 최상급 표현이 포함된 퀴즈 문제들을 추출하여 목록으로 보여줍니다.

## Prompt
"현재 프로젝트의 `questions.json` 파일을 분석해 줘. 만약 `$ARGUMENTS`가 주어졌다면 해당 값과 일치하는 `category` 내에서만 찾고, 그렇지 않다면 전체 문제를 대상으로 해.
`question_text`에 '가장', '최초', '최대'라는 단어가 포함된 모든 문제를 찾아줘.

결과는 아래 형식으로 목록화해서 보여줘:
- [카테고리] 문제 내용 (정답: X)
"
