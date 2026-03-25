-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secondme_user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" DATETIME NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "matched_user_id" TEXT NOT NULL,
    "match_score" REAL NOT NULL,
    "match_reason" TEXT,
    "agent_conversation_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_matched_user_id_fkey" FOREIGN KEY ("matched_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_agent_conversation_id_fkey" FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "compatibility_score" REAL,
    "summary" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "agent_conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agent_conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "secondme_note_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "a2a_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_a_id" TEXT NOT NULL,
    "user_b_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "common_tags" TEXT NOT NULL,
    "common_tag_count" INTEGER NOT NULL DEFAULT 0,
    "messages" JSONB,
    "compatibility_score" REAL,
    "conversation_quality" JSONB,
    "highlights" TEXT NOT NULL,
    "analysis_pros" TEXT NOT NULL,
    "analysis_cons" TEXT NOT NULL,
    "summary" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "a2a_conversations_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "a2a_conversations_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_secondme_user_id_key" ON "users"("secondme_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_user_id_matched_user_id_key" ON "matches"("user_id", "matched_user_id");

-- CreateIndex
CREATE INDEX "a2a_conversations_user_a_id_idx" ON "a2a_conversations"("user_a_id");

-- CreateIndex
CREATE INDEX "a2a_conversations_user_b_id_idx" ON "a2a_conversations"("user_b_id");

-- CreateIndex
CREATE INDEX "a2a_conversations_status_idx" ON "a2a_conversations"("status");

-- CreateIndex
CREATE INDEX "a2a_conversations_compatibility_score_idx" ON "a2a_conversations"("compatibility_score");

-- CreateIndex
CREATE INDEX "a2a_conversations_common_tag_count_idx" ON "a2a_conversations"("common_tag_count");

-- CreateIndex
CREATE UNIQUE INDEX "a2a_conversations_user_a_id_user_b_id_key" ON "a2a_conversations"("user_a_id", "user_b_id");
