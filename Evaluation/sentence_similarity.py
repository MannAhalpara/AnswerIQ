from sentence_transformers import SentenceTransformer, util

# Loads once, reuse across multiple calls
model = SentenceTransformer("all-MiniLM-L6-v2")


def semantic_score(student_answer, reference_answer, max_marks=10):
    emb_student = model.encode(student_answer, convert_to_tensor=True)
    emb_reference = model.encode(reference_answer, convert_to_tensor=True)

    # Cosine similarity gives a value between 0 and 1
    similarity = util.cos_sim(emb_student, emb_reference).item()

    score = round(similarity * max_marks, 2)

    return {
        "similarity": round(similarity, 4),   # e.g. 0.87
        "score": score,
        "out_of": max_marks
    }


if __name__ == "__main__":
    reference = "Cloud computing delivers computing services like storage, servers, and software over the internet on a pay-as-you-go basis."
    student = "Cloud computing means using the internet to access and store data instead of using your own computer hardware."

    result = semantic_score(student, reference, max_marks=10)
    print(result)