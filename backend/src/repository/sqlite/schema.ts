import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
  check,
} from "drizzle-orm/sqlite-core";

// ---------- USERS ----------

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),

    createdAt: integer("created_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),

    updatedAt: integer("updated_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

// ---------- NOTES ----------

export const notes = sqliteTable(
  "notes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull().default(""),

    content: text("content").notNull().default(""),

    // plain | checklist
    type: text("type", {
      enum: ["plain", "checklist"],
    })
      .notNull()
      .default("plain"),

    // JSON array, used when type = checklist
    checklist: text("checklist", { mode: "json" })
      .$type<{ id: string; text: string; checked: boolean }[]>()
      .notNull()
      .default(sql`'[]'`),

    color: text("color").notNull().default("default"),

    isPinned: integer("is_pinned", { mode: "boolean" })
      .notNull()
      .default(false),

    isArchived: integer("is_archived", { mode: "boolean" })
      .notNull()
      .default(false),

    // Soft deletion; restore before permanent deletion.
    isTrashed: integer("is_trashed", { mode: "boolean" })
      .notNull()
      .default(false),

    trashedAt: integer("trashed_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),

    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("notes_user_idx").on(table.userId),
    index("notes_user_updated_idx").on(table.userId, table.updatedAt),
    index("notes_user_pinned_idx").on(table.userId, table.isPinned),
    index("notes_user_archive_idx").on(table.userId, table.isArchived),
    index("notes_user_trash_idx").on(table.userId, table.isTrashed),
  ],
);

// ---------- LABELS ----------

export const labels = sqliteTable(
  "labels",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("labels_user_name_unique").on(table.userId, table.name),
    index("labels_user_idx").on(table.userId),
  ],
);

// ---------- NOTE ↔ LABELS ----------

export const noteLabels = sqliteTable(
  "note_labels",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),

    labelId: text("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.labelId] }),
    index("note_labels_label_idx").on(table.labelId),
  ],
);

// ---------- REFRESH TOKEN SESSIONS ----------

export const refreshTokens = sqliteTable(
  "refresh_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Store a cryptographic hash, never the raw refresh token.
    tokenHash: text("token_hash").notNull(),

    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),

    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("refresh_tokens_hash_unique").on(table.tokenHash),
    index("refresh_tokens_user_idx").on(table.userId),
    index("refresh_tokens_expiry_idx").on(table.expiresAt),
  ],
);

// ---------- INFERRED TYPES ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
