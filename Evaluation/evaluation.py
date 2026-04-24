from sentence_transformers import SentenceTransformer, util
from concept import concept_coverage_score
from keywords import keyword_score

semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

WEIGHTS = {
    "concept_coverage":    0.50,
    "semantic_similarity": 0.30,
    "keyword_matching":    0.20
}

def _semantic_score(student_answer, reference_answer, max_marks):
    emb_student   = semantic_model.encode(student_answer,   convert_to_tensor=True)
    emb_reference = semantic_model.encode(reference_answer, convert_to_tensor=True)
    similarity = util.cos_sim(emb_student, emb_reference).item()
    return {
        "score":      round(similarity * max_marks, 2),
        "similarity": round(similarity, 4)
    }

def score_answer(question, student_answer, reference_answer, max_marks=10):
    print("  Running semantic similarity...")
    semantic = _semantic_score(student_answer, reference_answer, max_marks)

    try:
        print("  Running concept coverage...")
        concept  = concept_coverage_score(student_answer, reference_answer, max_marks)
        concept_failed = False
    except Exception as e:
        print(f"  Concept coverage failed: {e}")
        concept = {"score": 0, "total_concepts": 0, "covered": [], "missed": []}
        concept_failed = True

    try:
        print("  Running keyword matching...")
        keyword  = keyword_score(student_answer, reference_answer, max_marks)
        keyword_failed = False
    except Exception as e:
        print(f"  Keyword matching failed: {e}")
        keyword = {"score": 0, "matched": [], "missed": []}
        keyword_failed = True


    if concept_failed or keyword_failed:
        final_score = semantic["score"]
    else:
        final_score = (
            (concept["score"]  * WEIGHTS["concept_coverage"])    +
            (semantic["score"] * WEIGHTS["semantic_similarity"])  +
            (keyword["score"]  * WEIGHTS["keyword_matching"])
        )
    
    # Round off value to nearest 0.5 (2, 2.5, 3, etc.)
    final_score = round(final_score * 2.0) / 2.0

    return {
        "question":    question,
        "final_score": min(final_score, max_marks),
        "out_of":      max_marks,
        "breakdown": {
            "concept_coverage": {
                "weight":         "50%",
                "score":          concept["score"],
                "total_concepts": concept["total_concepts"],
                "covered":        concept["covered"],
                "missed":         concept["missed"]
            },
            "semantic_similarity": {
                "weight":     "30%",
                "score":      semantic["score"],
                "similarity": semantic["similarity"]
            },
            "keyword_matching": {
                "weight":  "20%",
                "score":   keyword["score"],
                "matched": keyword["matched"],
                "missed":  keyword["missed"]
            }
        }
    }

if __name__ == "__main__":
    question  = "What is cloud computing?"
    reference = "Cloud computing delivers computing services like storage, servers, and software over the internet on a pay-as-you-go basis. It offers scalability and cost efficiency."
    student   = "Cloud computing means using the internet to access and store data instead of using your own hardware. It is cost effective."

    print(f"\nScoring answer for: {question}")
    print("-" * 50)

    result = score_answer(question, student, reference, max_marks=10)

    print(f"\nFINAL SCORE : {result['final_score']} / {result['out_of']}")
    print("\nBREAKDOWN:")
    for method, data in result["breakdown"].items():
        print(f"  {method} ({data['weight']}): {data['score']}")
    print(f"\nConcepts covered : {result['breakdown']['concept_coverage']['covered']}")
    print(f"Concepts missed  : {result['breakdown']['concept_coverage']['missed']}")
    print(f"Keywords matched : {result['breakdown']['keyword_matching']['matched']}")
    print(f"Keywords missed  : {result['breakdown']['keyword_matching']['missed']}")
    print(f"Semantic score   : {result['breakdown']['semantic_similarity']['similarity']}")