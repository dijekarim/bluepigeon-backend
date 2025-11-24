-- Migration for Direct Messaging System (Feature 2) - PostgreSQL Version
-- This migration creates the conversations and direct_messages tables
-- and adds read_by field to existing chats table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table for 1-on-1 chats
DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one UUID NOT NULL,
  participant_two UUID NOT NULL,
  last_message_at TIMESTAMP NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_conversation_participants UNIQUE (participant_one, participant_two),
  CONSTRAINT fk_conversations_participant_one FOREIGN KEY (participant_one) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_conversations_participant_two FOREIGN KEY (participant_two) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_conversations_participant_one ON conversations(participant_one);
CREATE INDEX idx_conversations_participant_two ON conversations(participant_two);

-- Create trigger to auto-update updatedAt timestamp for conversations
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at_trigger
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversations_updated_at();

-- Create custom type for file_type enum
DO $$ BEGIN
  CREATE TYPE file_type_enum AS ENUM ('text', 'image', 'voice');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create direct_messages table for messages within conversations
DROP TABLE IF EXISTS direct_messages CASCADE;
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NULL,
  file_path VARCHAR(255) NULL,
  file_type file_type_enum NOT NULL DEFAULT 'text',
  read_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_direct_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_direct_messages_sender FOREIGN KEY (sender_id) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_created_at ON direct_messages("createdAt");

-- Create trigger to auto-update updatedAt timestamp for direct_messages
CREATE OR REPLACE FUNCTION update_direct_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER direct_messages_updated_at_trigger
BEFORE UPDATE ON direct_messages
FOR EACH ROW
EXECUTE FUNCTION update_direct_messages_updated_at();

-- Add read_by field to existing chats table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chats' AND column_name = 'read_by'
  ) THEN
    ALTER TABLE chats 
    ADD COLUMN read_by JSONB NOT NULL DEFAULT '[]'::jsonb;
    
    COMMENT ON COLUMN chats.read_by IS 'Array of user UUIDs who have read this message';
  END IF;
END $$;

-- Create indexes for chats table for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_sender ON chats(sender);
CREATE INDEX IF NOT EXISTS idx_chats_receiver ON chats(receiver);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats("createdAt");

-- Create trigger to auto-update updatedAt timestamp for chats (if not exists)
CREATE OR REPLACE FUNCTION update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chats_updated_at_trigger ON chats;
CREATE TRIGGER chats_updated_at_trigger
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION update_chats_updated_at();

-- Verify tables were created successfully
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created tables: conversations, direct_messages';
  RAISE NOTICE 'Enhanced table: chats (added read_by field)';
END $$;

-- ------------------------------------------------------------------
-- Huddle session tables (Feature 4)
-- ------------------------------------------------------------------

-- Enums for huddle domain
DO $$ BEGIN
  CREATE TYPE huddle_context_enum AS ENUM ('channel', 'dm');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE huddle_status_enum AS ENUM ('active', 'ended', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE huddle_end_reason_enum AS ENUM ('manual', 'timeout', 'empty');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE huddle_participant_status_enum AS ENUM ('joined', 'left');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing tables if rerunning migration locally
DROP TABLE IF EXISTS huddle_participants CASCADE;
DROP TABLE IF EXISTS huddle_sessions CASCADE;

CREATE TABLE huddle_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_type huddle_context_enum NOT NULL,
  context_id UUID NOT NULL,
  initiator_id UUID NOT NULL,
  status huddle_status_enum NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  ended_reason huddle_end_reason_enum NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_huddle_sessions_initiator FOREIGN KEY (initiator_id) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_huddle_sessions_context_status
  ON huddle_sessions(context_type, context_id, status);

CREATE OR REPLACE FUNCTION update_huddle_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER huddle_sessions_updated_at_trigger
BEFORE UPDATE ON huddle_sessions
FOR EACH ROW
EXECUTE FUNCTION update_huddle_sessions_updated_at();

CREATE TABLE huddle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status huddle_participant_status_enum NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_huddle_participants_session FOREIGN KEY (session_id) REFERENCES huddle_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_huddle_participants_user FOREIGN KEY (user_id) REFERENCES user_data(_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT unique_huddle_participant UNIQUE (session_id, user_id)
);

CREATE OR REPLACE FUNCTION update_huddle_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER huddle_participants_updated_at_trigger
BEFORE UPDATE ON huddle_participants
FOR EACH ROW
EXECUTE FUNCTION update_huddle_participants_updated_at();
