Nexus — The Organizational Memory Engine
Nexus is a real-time meeting companion and semantic memory layer. It listens to live meeting streams, dynamically extracts structured knowledge graphs (entities, relations, and decisions), automatically detects decision contradictions against history, and indexes everything into a vector database for cited retrieval.

🚀 Key Features
Real-time Speech Capture & Live Sync: Listen to meetings via browser microphone streaming over WebSockets (Socket.IO).
Live Knowledge Graph Extraction: Automatically extract entities (people, projects, tools, topics) and relations using fast models (Groq LLaMA 3) and visualize them dynamically.
Proactive Contradiction Detection: Evaluate newly made decisions against the historical decision corpus in real-time, instantly flagging if a decision is consistent, refines, or directly contradicts previous team agreements.
Hybrid RAG Memory Explorer: Query past meetings using combined vector search (Pinecone) and knowledge graph context to generate cited answers with references to specific meetings, speakers, and timestamps.
🛠️ Technology Stack
Frontend: Next.js (App Router), React, TailwindCSS, custom SVG-based interactive graphs.
Real-time Server: Node.js HTTP server integrated with Socket.IO.
Database & Auth: PostgreSQL (Supabase / Neon), Firebase Auth.
Vector Store: Pinecone Vector Database.
AI Pipelines: Groq SDK (Whisper for transcription, LLaMA-3 models for extraction, contradiction analysis, and RAG synthesis).
⚙️ Environment Configuration
Create a .env.local (for development) or .env.production (for production deployment) in the project root:

ini

# Server Configuration
PORT=3000
NODE_ENV=development
# Database Setup (PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
# Firebase Admin SDK Credentials
# (Set to the path of your Firebase service-account JSON file)
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/firebase-admin.json
FIREBASE_PROJECT_ID=your-project-id
# Firebase Frontend Configuration
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
# Supabase (Used for storing meetings and structured relation nodes)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Pinecone (Vector database for semantic search embeddings)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=nexus
# Groq API Key (Used for transcription & fast LLaMA-3 extractions)
GROQ_API_KEY=your-groq-api-key
💻 Local Setup & Execution
1. Install Dependencies
bash

npm install
2. Setup the Databases
Ensure PostgreSQL and Pinecone instances are running and env keys are populated.
Run the database migrations to set up the schema:
bash

npm run db:migrate
3. Run the Development Server
bash

npm run dev
Open http://localhost:3000 to view the application.

📖 Step-by-Step User Guide
Follow this user journey to use the application to its full capacity:

Step 1: Authentication & Onboarding
Visit the landing page and click Get Started or Login.
Create an account or sign in using email/password. This initializes your personal credentials and session.
Step 2: Dashboard Overview
Upon signing in, you will be taken to /dashboard.
The dashboard displays statistics like Total Meetings Stored, Active Meetings, and a list of past meetings with their status (live or ended).
Step 3: Create and Join a Live Meeting
Click the Start New Meeting button.
Enter a meeting title (e.g., Launch Architecture Sync) and choose the platform (Zoom, Google Meet, Teams, or local mic).
You will be redirected to the dynamic live meeting workspace (/meeting/[id]).
Step 4: Live Audio Capture & Real-time Transcription
Click Start Recording to authorize browser microphone access.
As you speak, the audio chunks are captured, sliced, and sent over Socket.IO to the backend.
The server transcribes the audio in real-time and streams the transcript segments back. You will see them appear instantly in the Transcript Feed.
Step 5: Real-time Knowledge Graph & Contradiction Detection
As the transcript grows, the backend background process extracts structural entities (people, tools, and projects) and proposed decisions.
The Knowledge Graph on the page dynamically grows with nodes representing these entities.
If a decision is made, the Contradiction Detector analyzes it against history:
Green Flag (consistent or refines): The decision aligns with past records.
Red Flag (contradicts): Nexus flags the conflict immediately in the Contradictions Alert Panel, showing you which historical decision is violated and why.
Step 6: End Meeting and Review Summary
Click Stop Recording, then click End Meeting.
The backend generates a comprehensive summary, action items list, and saves the final transcript.
You will be transitioned to the static Meeting Review screen, allowing you to scroll the complete history, final graph state, and export key insights.
Step 7: Explore the Collective Memory (Semantic Chat & RAG)
Go to the Memory Explorer (/explorer) page.
Ask questions about your history (e.g., "Why did we choose Vendor B over Vendor A?").
The explorer performs hybrid retrieval, searching Pinecone for semantic snippets and joining them with the knowledge graph.
It outputs an AI response with inline citations (e.g., [1], [2]). Clicking on a citation displays the exact speaker, timestamp, and source meeting.
🛠️ Production Deployment Guide (PM2)
If you are deploying Nexus on a remote server (e.g., DigitalOcean Droplet) using PM2, follow these steps to avoid environment caching pitfalls:

Upload your credentials (firebase-admin.json) to the server.
Clear any terminal environmental cache (Node's --env-file does not override already set shell variables):
bash

unset GOOGLE_APPLICATION_CREDENTIALS
Build the production pages:
bash

npm run build
Start the process with PM2 pointing to the production environment file:
bash

NODE_ENV=production GOOGLE_APPLICATION_CREDENTIALS=/var/www/Nexus/firebase-admin.json pm2 start server.js --name nexus-app --cwd /var/www/Nexus --node-args="--env-file=/var/www/Nexus/.env.production"
pm2 save
