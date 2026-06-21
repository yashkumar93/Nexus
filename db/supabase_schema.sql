-- ============================================================
-- Nexus — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- Organizations
-- ============================================================
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Teams
-- ============================================================
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Meetings
-- ============================================================
create table if not exists meetings (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  title       text not null,
  status      text not null default 'live',  -- 'live' | 'ended'
  summary     text,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  platform    text default 'manual',
  created_at  timestamptz not null default now()
);

create index if not exists meetings_team_id_idx on meetings(team_id);
create index if not exists meetings_started_at_idx on meetings(started_at desc);

-- ============================================================
-- Meeting Participants
-- ============================================================
create table if not exists meeting_participants (
  meeting_id  uuid not null references meetings(id) on delete cascade,
  user_id     text not null,  -- Firebase UID (string)
  joined_at   timestamptz not null default now(),
  primary key (meeting_id, user_id)
);

-- ============================================================
-- Transcript Segments
-- ============================================================
create table if not exists transcript_segments (
  id              uuid primary key default gen_random_uuid(),
  meeting_id      uuid not null references meetings(id) on delete cascade,
  speaker_user_id text,                -- Firebase UID of the speaker
  speaker_name    text,
  text            text not null,
  start_ts        numeric,             -- seconds from meeting start
  end_ts          numeric,
  created_at      timestamptz not null default now()
);

create index if not exists transcript_meeting_id_idx on transcript_segments(meeting_id);
create index if not exists transcript_start_ts_idx   on transcript_segments(start_ts asc);

-- ============================================================
-- Row Level Security (RLS)
-- By default we disable RLS so server-side calls always work.
-- Enable and customize once you have proper auth policies.
-- ============================================================
alter table organizations        disable row level security;
alter table teams                disable row level security;
alter table meetings             disable row level security;
alter table meeting_participants disable row level security;
alter table transcript_segments  disable row level security;
