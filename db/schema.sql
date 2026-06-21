-- Nexus Database Schema
-- Postgres + pgvector

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  retention_policy_days INTEGER DEFAULT 365,
  plan_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_org ON teams(org_id);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('org_admin', 'member', 'guest')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- USER <-> TEAM (many-to-many)
-- ============================================================
CREATE TABLE user_teams (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, team_id)
);

-- ============================================================
-- MEETINGS
-- ============================================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  platform VARCHAR(50) DEFAULT 'manual' CHECK (platform IN ('zoom', 'meet', 'teams', 'manual')),
  status VARCHAR(20) DEFAULT 'live' CHECK (status IN ('live', 'ended', 'processing')),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_team ON meetings(team_id);
CREATE INDEX idx_meetings_status ON meetings(status);

-- ============================================================
-- MEETING PARTICIPANTS (many-to-many)
-- ============================================================
CREATE TABLE meeting_participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_external BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

-- ============================================================
-- TRANSCRIPT SEGMENTS
-- ============================================================
CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  speaker_name VARCHAR(255),
  text TEXT NOT NULL,
  start_ts REAL NOT NULL,
  end_ts REAL NOT NULL,
  is_external BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcript_meeting ON transcript_segments(meeting_id);
CREATE INDEX idx_transcript_speaker ON transcript_segments(speaker_user_id);

-- ============================================================
-- EMBEDDINGS (pgvector)
-- ============================================================
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('transcript_segment', 'document_chunk', 'decision')),
  source_id UUID NOT NULL,
  content TEXT NOT NULL,
  vector vector(384),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);
CREATE INDEX idx_embeddings_team ON embeddings(team_id);
-- ivfflat index for vector similarity search (created after data insertion for better quality)
-- CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- KNOWLEDGE NODES
-- ============================================================
CREATE TABLE knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('person', 'project', 'decision', 'customer', 'tool', 'topic')),
  label VARCHAR(500) NOT NULL,
  claim_text TEXT,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'reversed')),
  decided_at TIMESTAMPTZ,
  superseded_by_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  created_from_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nodes_org ON knowledge_nodes(org_id);
CREATE INDEX idx_nodes_type ON knowledge_nodes(type);
CREATE INDEX idx_nodes_status ON knowledge_nodes(status);
CREATE INDEX idx_nodes_team ON knowledge_nodes(team_id);

-- ============================================================
-- KNOWLEDGE EDGES
-- ============================================================
CREATE TABLE knowledge_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('decided_by', 'owns', 'related_to', 'supersedes', 'mentions', 'contradicts', 'part_of')),
  source_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edges_from ON knowledge_edges(from_node_id);
CREATE INDEX idx_edges_to ON knowledge_edges(to_node_id);
CREATE INDEX idx_edges_meeting ON knowledge_edges(source_meeting_id);

-- ============================================================
-- ACTION ITEMS
-- ============================================================
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_actions_owner ON action_items(owner_user_id);
CREATE INDEX idx_actions_meeting ON action_items(meeting_id);
CREATE INDEX idx_actions_status ON action_items(status);

-- ============================================================
-- CONTRADICTION FLAGS
-- ============================================================
CREATE TABLE contradiction_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_node_id_a UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  decision_node_id_b UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  confidence REAL DEFAULT 0.0,
  rationale TEXT,
  resolution VARCHAR(30) DEFAULT 'unresolved' CHECK (resolution IN ('unresolved', 'superseded', 'false_positive')),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contradictions_meeting ON contradiction_flags(meeting_id);
CREATE INDEX idx_contradictions_resolution ON contradiction_flags(resolution);

-- ============================================================
-- DOCUMENTS (for future ingestion)
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  source_type VARCHAR(30) DEFAULT 'upload' CHECK (source_type IN ('upload', 'slack', 'wiki')),
  storage_uri TEXT,
  content TEXT,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  query_text TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
