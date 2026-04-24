# AnswerIQ

AnswerIQ is an automated evaluation system designed to assist educational institutions in grading student answer sheets. The system uses AI to extract text from documents and provides a detailed scoring breakdown based on reference answers provided by faculty.

## Features

The system includes several modules for processing and evaluating educational content:

- **OCR Processing**: Uses Google Gemini to extract text from PDF submissions with high accuracy.
- **Evaluation Engine**: Uses a multi-dimensional approach to scoring answers:
  - **Concept Coverage**: Verifies that key concepts are mentioned.
  - **Semantic Similarity**: Uses Sentence Transformers to check the contextual meaning of the student's response.
  - **Keyword Matching**: Checks for specific technical terms.
- **Faculty Tools**: Provides a dashboard for managing courses, uploading answer keys, and reviewing results.
- **Student Access**: Allows students to view their marks and understand where they lost points through detailed feedback.
- **Database Management**: Integrated with Supabase for secure data storage and real-time updates.

## Technical Details

- **Frontend**: Built with Next.js and TypeScript.
- **Backend**: Python-based FastAPI server.
- **LLM Integration**: Uses Groq and Google's Gemini Flash for language processing and OCR.
- **NLP**: Employs the Sentence Transformers library for semantic analysis.

## Setup and Installation

### Requirements

- Python 3.9 or higher
- Node.js 18 or higher
- A Supabase account and project
- API keys for Groq and Google AI Studio

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MannAhalpara/AnswerIQ.git
   cd AnswerIQ
   ```

2. **Backend Configuration**
   - Navigate to the `backend` directory.
   - Install dependencies: `pip install -r requirements.txt`.
   - Create a `.env` file with your credentials (GROQ_API_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY).

3. **Frontend Configuration**
   - Navigate to the `frontend` directory.
   - Install dependencies: `npm install`.
   - Start the development server: `npm run dev`.

## Directory Structure

- `AI_OCR/`: Modules for image processing and OCR.
- `backend/`: API server and database logic.
- `Evaluation/`: Core scoring algorithms.
- `frontend/`: User interface components and pages.
- `supabase/`: Database schema and configuration.

## License

This project is licensed under the MIT License.
