import json
import os
from groq import Groq

# 🔑 Load from Environment Variable
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def call_llm(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return response.choices[0].message.content.strip()


def clean_json(raw):
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


def extract_keywords(reference_answer):
    prompt = f"""
Extract 5 to 10 important keywords or technical terms.

Return ONLY JSON array.

Answer:
{reference_answer}
"""

    raw = call_llm(prompt)
    return json.loads(clean_json(raw))


def keyword_score(student_answer, reference_answer, max_marks=10):
    keywords = extract_keywords(reference_answer)

    student_lower = student_answer.lower()

    matched = [kw for kw in keywords if kw.lower() in student_lower]
    missed = [kw for kw in keywords if kw.lower() not in student_lower]

    score = round((len(matched) / len(keywords)) * max_marks, 2) if keywords else 0

    return {
        "score": score,
        "out_of": max_marks,
        "total_keywords": len(keywords),
        "matched_count": len(matched),
        "matched": matched,
        "missed": missed
    }


if __name__ == "__main__":
    reference = "Cloud computing delivers computing services like storage, servers, and software over the internet on a pay-as-you-go basis. It offers scalability and cost efficiency."
    student = "Cloud computing means using the internet to access and store data instead of using your own hardware. It is cost effective."

    result = keyword_score(student, reference)
    print(result)