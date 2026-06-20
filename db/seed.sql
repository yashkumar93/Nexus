-- Seed data for Continuum
-- All passwords are 'demo123' hashed with bcrypt ($2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76)

-- 1. Organizations
INSERT INTO organizations (id, name, retention_policy_days, plan_tier) VALUES
('d7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Continuum Labs', 365, 'enterprise');

-- 2. Teams
INSERT INTO teams (id, org_id, name) VALUES
('e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Engineering'),
('f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Product & Design'),
('a3c9e6bb-e6d2-43bb-a1a7-ff7db091350a', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Finance');

-- 3. Users
INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES
('a0f90e0c-99d9-43c3-b9db-3f8c85b1a0d1', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Priya Patel', 'priya@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'org_admin'),
('b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Devon Miller', 'devon@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'member'),
('c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Sam Chen', 'sam@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'member'),
('d0f90e0c-99d9-43c3-b9db-3f8c85b1a0d4', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Nadia Ivanova', 'nadia@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'member'),
('e0f90e0c-99d9-43c3-b9db-3f8c85b1a0d5', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Maya Lin', 'maya@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'member'),
('f0f90e0c-99d9-43c3-b9db-3f8c85b1a0d6', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'Sarah Jenkins', 'sarah@continuum.ai', '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76', 'member');

-- 4. User Teams
INSERT INTO user_teams (user_id, team_id) VALUES
('a0f90e0c-99d9-43c3-b9db-3f8c85b1a0d1', 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef'), -- Priya in Eng
('a0f90e0c-99d9-43c3-b9db-3f8c85b1a0d1', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'), -- Priya in Product
('b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef'), -- Devon in Eng
('c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef'), -- Sam in Eng
('d0f90e0c-99d9-43c3-b9db-3f8c85b1a0d4', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'), -- Nadia in Product
('e0f90e0c-99d9-43c3-b9db-3f8c85b1a0d5', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'), -- Maya in Product
('f0f90e0c-99d9-43c3-b9db-3f8c85b1a0d6', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'); -- Sarah in Product

-- 5. Meetings (Past Meetings)
INSERT INTO meetings (id, team_id, title, started_at, ended_at, platform, status, summary) VALUES
('11111111-1111-1111-1111-111111111111', 'a3c9e6bb-e6d2-43bb-a1a7-ff7db091350a', 'Finance Review', '2026-05-29 10:00:00+00', '2026-05-29 10:45:00+00', 'meet', 'ended', 'Approved Vendor A for payments processing based on scale pricing and compliance review.'),
('22222222-2222-2222-2222-222222222222', 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'Architecture Council', '2026-06-03 14:00:00+00', '2026-06-03 15:00:00+00', 'zoom', 'ended', 'Postgres confirmed as system of record for all customer and billing data. Scaling limits evaluated.');

-- 6. Meeting Participants
INSERT INTO meeting_participants (meeting_id, user_id, joined_at) VALUES
('11111111-1111-1111-1111-111111111111', 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', '2026-05-29 10:00:00+00'),
('11111111-1111-1111-1111-111111111111', 'e0f90e0c-99d9-43c3-b9db-3f8c85b1a0d5', '2026-05-29 10:01:00+00'),
('22222222-2222-2222-2222-222222222222', 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', '2026-06-03 14:00:00+00'),
('22222222-2222-2222-2222-222222222222', 'c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', '2026-06-03 14:02:00+00');

-- 7. Transcript Segments
INSERT INTO transcript_segments (id, meeting_id, speaker_user_id, speaker_name, text, start_ts, end_ts) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', 'Devon Miller', 'Vendor A was selected because scale pricing and compliance were already approved.', 1112.0, 1120.0),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', 'Sam Chen', 'Postgres remains the system of record for customer and billing data.', 2468.0, 2475.0);

-- 8. Knowledge Nodes
INSERT INTO knowledge_nodes (id, org_id, type, label, claim_text, owner_user_id, status, decided_at, created_from_meeting_id, team_id) VALUES
('55555555-5555-5555-5555-555555555555', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'topic', 'Payments Vendor', 'Payments provider integrations for checkout flow', NULL, 'active', NULL, NULL, 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'),
('66666666-6666-6666-6666-666666666666', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'tool', 'Vendor A', 'Primary payment gateway provider', NULL, 'active', NULL, NULL, 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'),
('77777777-7777-7777-7777-777777777777', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'tool', 'Vendor B', 'Alternative payment gateway provider with lower flat rates', NULL, 'active', NULL, NULL, 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'),
('88888888-8888-8888-8888-888888888888', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'decision', 'Use Vendor A', 'Use Vendor A for payments processing.', 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', 'active', '2026-05-29 10:18:32+00', '11111111-1111-1111-1111-111111111111', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'),
('99999999-9999-9999-9999-999999999999', 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', 'decision', 'Database Platform', 'Postgres remains the system of record for customer and billing data.', 'c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', 'active', '2026-06-03 14:41:08+00', '22222222-2222-2222-2222-222222222222', 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef');

-- 9. Knowledge Edges
INSERT INTO knowledge_edges (from_node_id, to_node_id, relation_type, source_meeting_id) VALUES
('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'related_to', NULL),
('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'related_to', NULL),
('66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'decided_by', '11111111-1111-1111-1111-111111111111'),
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'decided_by', '22222222-2222-2222-2222-222222222222');

-- 10. Action Items
INSERT INTO action_items (meeting_id, owner_user_id, description, due_date, status) VALUES
('11111111-1111-1111-1111-111111111111', 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2', 'Pull Vendor A contract thresholds into the launch brief.', '2026-06-25', 'open'),
('11111111-1111-1111-1111-111111111111', 'e0f90e0c-99d9-43c3-b9db-3f8c85b1a0d5', 'Confirm whether Vendor B has the required compliance certification.', '2026-06-28', 'open');

-- 11. Audit Logs
INSERT INTO audit_log (user_id, action, resource_type, query_text) VALUES
('d0f90e0c-99d9-43c3-b9db-3f8c85b1a0d4', 'memory.search', 'embeddings', 'why did we originally pick vendor A?'),
('a0f90e0c-99d9-43c3-b9db-3f8c85b1a0d1', 'graph.node.read', 'knowledge_nodes', NULL),
('c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3', 'meeting.join', 'meetings', NULL);
