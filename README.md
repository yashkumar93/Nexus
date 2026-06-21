# Nexus — The Organizational Memory Engine

## Overview

Nexus is an AI-powered organizational memory platform that transforms live meetings into a searchable, structured knowledge base. Instead of allowing valuable discussions, decisions, and context to disappear after a meeting ends, Nexus continuously captures conversations, extracts knowledge in real time, identifies decision conflicts, and builds a persistent semantic memory for teams.

By combining live transcription, knowledge graphs, contradiction analysis, and retrieval-augmented generation (RAG), Nexus ensures that every decision remains discoverable, explainable, and connected to its historical context.

---

## Key Features

### Real-Time Meeting Intelligence

Capture live meeting conversations through browser-based audio streaming. Audio is processed in real time, generating synchronized transcripts and structured insights as discussions unfold.

### Dynamic Knowledge Graph Generation

Automatically identify and extract:

* People
* Teams
* Projects
* Technologies
* Business Topics
* Decisions

These entities and their relationships are visualized through an evolving knowledge graph, providing teams with a live representation of organizational knowledge.

### Decision Contradiction Detection

Nexus continuously compares newly proposed decisions against historical meeting records.

The system can automatically determine whether a decision:

* Aligns with previous agreements
* Refines an existing decision
* Directly contradicts past conclusions

When conflicts are detected, users receive immediate alerts along with supporting historical evidence and reasoning.

### Hybrid Memory Explorer (RAG + Knowledge Graph)

Search across all previous meetings using natural language.

Nexus combines:

* Vector similarity search
* Knowledge graph relationships
* Meeting metadata

to generate contextual answers with citations linking directly to the original meeting, speaker, and timestamp.

### Persistent Organizational Memory

Every meeting contributes to a growing organizational knowledge layer, ensuring that decisions, rationale, and discussions remain accessible long after meetings conclude.

---

## Technology Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Interactive SVG-based Graph Visualization

### Backend & Real-Time Infrastructure

* Node.js
* Socket.IO
* WebSockets

### Authentication & Database

* PostgreSQL (Supabase / Neon)
* Firebase Authentication

### Vector Database

* Pinecone

### AI & Language Processing

* Groq SDK
* Whisper (Speech-to-Text)
* LLaMA 3 Models
* Knowledge Extraction Pipelines
* Contradiction Analysis Engine
* RAG-Based Answer Generation

---

## System Workflow

### 1. Live Meeting Capture

Users start a meeting session and grant microphone access. Audio streams continuously to the backend through Socket.IO connections.

### 2. Real-Time Transcription

Incoming audio is transcribed using Whisper, producing live transcript updates visible to participants.

### 3. Knowledge Extraction

Transcripts are analyzed to identify:

* Entities
* Relationships
* Decisions
* Action Items

The extracted information is used to construct a dynamic knowledge graph.

### 4. Decision Analysis

Whenever a new decision is detected, Nexus evaluates it against historical organizational records and identifies potential conflicts or refinements.

### 5. Semantic Indexing

Transcripts, summaries, decisions, and extracted knowledge are embedded and stored in Pinecone, creating a searchable organizational memory layer.

### 6. Intelligent Retrieval

Users can query past discussions in natural language. Nexus retrieves relevant information using hybrid search techniques and generates cited responses grounded in meeting history.

---

## User Journey

### Authentication & Onboarding

Users create an account or sign in to access their workspace and meeting history.

### Dashboard

The dashboard provides:

* Total meetings stored
* Active meetings
* Historical meeting records
* Meeting status tracking

### Create a Meeting

Users can launch a new meeting session and choose a meeting source such as:

* Zoom
* Google Meet
* Microsoft Teams
* Local Microphone

### Live Collaboration

During the meeting, participants can observe:

* Live transcripts
* Real-time knowledge graph updates
* Decision conflict alerts
* Emerging organizational insights

### Meeting Review

After ending a meeting, Nexus automatically generates:

* Executive summary
* Action items
* Final transcript
* Knowledge graph snapshot

### Memory Exploration

Teams can search historical knowledge and ask questions such as:

> Why did we choose Vendor B instead of Vendor A?

Nexus retrieves relevant evidence and provides answers with source citations linked to specific meetings, speakers, and timestamps.

---

## Core Value Proposition

Organizations lose significant amounts of knowledge after meetings because decisions, discussions, and rationale remain scattered across notes, recordings, and documents.

Nexus solves this problem by creating a continuously evolving organizational memory system that:

* Captures knowledge automatically
* Preserves decision history
* Prevents contradictory decision-making
* Makes institutional knowledge instantly searchable
* Provides explainable, citation-backed answers

Nexus transforms meetings from temporary conversations into a permanent, intelligent knowledge asset.
