import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

// =============================================================================
// Counted — business tables
//
// Replaces the Postgres schema that previously lived in
// `supabase/schema.sql` + `supabase/policies.sql`. RLS is gone — every
// route handler filters on `orgId` derived from the Better Auth session
// (see `src/lib/org.ts`).
//
// Better Auth's own tables (user / session / account / verification) are
// generated into `./auth-schema.ts` by the Better Auth CLI and re-exported
// at the bottom of this file. Re-run `npx @better-auth/cli generate` after
// adding/changing auth plugins.
// =============================================================================


// ----- orgs -----
// One row per organization. Created automatically by the
// `databaseHooks.user.create.after` hook in `src/lib/auth.ts` on signup.
export const orgs = pgTable('orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default('My Store'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})


// ----- profiles -----
// Links a Better Auth user to an org. `userId` is a partial-unique
// index so a deleted user doesn't collide with another NULL row, but
// each non-null user can only own one profile.
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'), // Better Auth user ids are strings, not UUIDs
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    fullName: text('full_name'),
    role: text('role').notNull().default('owner'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdUnique: uniqueIndex('profiles_user_id_unique')
      .on(t.userId)
      .where(sql`${t.userId} is not null`),
    orgIdIdx: index('profiles_org_id_idx').on(t.orgId),
  })
)


// ----- locations -----
export const locations = pgTable(
  'locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orgIdIdx: index('locations_org_id_idx').on(t.orgId),
  })
)


// ----- items -----
// `sku` is unique within an org (so two stores can have the same SKU
// without colliding) — the `onConflict` target on bulk-import relies on
// this composite index.
export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    sku: text('sku'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orgSkuUnique: uniqueIndex('items_org_sku_unique').on(t.orgId, t.sku),
    orgIdIdx: index('items_org_id_idx').on(t.orgId),
  })
)


// ----- stock_levels -----
// One row per (location, item) pair. `qty` and `reorder_level` are
// integers; nullable so we can set a row to "tracked, no level yet".
export const stockLevels = pgTable(
  'stock_levels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull().default(0),
    reorderLevel: integer('reorder_level'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    locationItemUnique: uniqueIndex('stock_levels_location_item_unique').on(
      t.locationId,
      t.itemId
    ),
    orgIdIdx: index('stock_levels_org_id_idx').on(t.orgId),
  })
)


// ----- transfers -----
// Append-only. The `transfer` route handler runs the row insert + the
// two stock_level updates in a single Drizzle transaction so a partial
// transfer is never visible.
export const transfers = pgTable(
  'transfers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    fromLocationId: uuid('from_location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    toLocationId: uuid('to_location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orgIdIdx: index('transfers_org_id_idx').on(t.orgId),
    orgCreatedIdx: index('transfers_org_created_idx').on(t.orgId, t.createdAt),
  })
)


// =============================================================================
// Better Auth tables — re-exported from the CLI-generated file.
//
// If the file doesn't exist yet, run:
//   npx @better-auth/cli@latest generate
// to create `src/lib/db/auth-schema.ts`, then re-run the import. The
// `*` export is wrapped to keep this file import-safe even before the
// generation step.
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
export * from './auth-schema'
