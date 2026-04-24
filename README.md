# AnswerIQ 🚀

AnswerIQ is an AI-powered automated evaluation system designed to streamline the grading process for educational institutions. By leveraging advanced OCR and Large Language Models, AnswerIQ can extract text from handwritten or digital answer sheets and provide detailed, criteria-based scoring.

## 🌟 Features

- **AI OCR Pipeline**: High-precision text extraction from PDF answer sheets using Google Gemini.
- **Intelligent Evaluation**: Automated scoring based on three key dimensions:
  - **Concept Coverage**: Ensures core concepts from the reference answer are present.
  - **Semantic Similarity**: Measures the contextual meaning using Sentence Transformers.
  - **Keyword Matching**: Validates the presence of technical terminology.
- **Faculty Dashboard**: Manage courses, upload reference answers, and review AI-generated scores.
- **Student Portal**: View evaluation results and detailed feedback.
- **Database Integration**: Robust data management powered by Supabase.

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Groq API (LLM), Google GenAI (Gemini)
- **Database**: Supabase (Postgres)
- **NLP**: Sentence Transformers (all-MiniLM-L6-v2)

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase Account
- API Keys: [Groq](https://console.groq.com/), [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MannAhalpara/AnswerIQ.git
   cd AnswerIQ
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   GROQ_API_KEY=your_groq_key
   GEMINI_API_KEY=your_gemini_key
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📂 Project Structure

- `AI_OCR/`: Core logic for image extraction and Gemini-powered OCR.
- `backend/`: FastAPI server and database services.
- `Evaluation/`: NLP modules for scoring and similarity analysis.
- `frontend/`: Next.js application for Admin and Faculty interfaces.
- `supabase/`: Database configurations and functions.

## 🛡️ License

This project is licensed under the MIT License.
