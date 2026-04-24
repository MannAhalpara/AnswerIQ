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


def concept_coverage_score(student_answer, reference_answer, max_marks=10):

    # Step 1: Extract concepts
    extract_prompt = f"""
Extract the main concepts from this reference answer.
Return ONLY a JSON array of short phrases.

Reference Answer: {reference_answer}
"""

    raw = call_llm(extract_prompt)
    concepts = json.loads(clean_json(raw))

    # Step 2: Check coverage
    check_prompt = f"""
Concepts:
{json.dumps(concepts)}

Student Answer:
{student_answer}

Check which concepts are covered (even paraphrased).

Return ONLY JSON:
{{
  "covered": [],
  "missed": []
}}
"""

    raw2 = call_llm(check_prompt)
    coverage = json.loads(clean_json(raw2))

    covered = len(coverage.get("covered", []))
    total = len(concepts)

    score = round((covered / total) * max_marks, 2) if total else 0

    return {
        "score": score,
        "out_of": max_marks,
        "total_concepts": total,
        "covered_count": covered,
        "covered": coverage.get("covered", []),
        "missed": coverage.get("missed", [])
    }


if __name__ == "__main__":
    reference = "Cloud computing delivers computing services like storage, servers, and software over the internet on a pay-as-you-go basis. It offers scalability and cost efficiency."
    student = "Cloud computing means using the internet to access and store data instead of using your own hardware. It is cost effective."

    result = concept_coverage_score(student, reference)
    print(result)