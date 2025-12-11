# Database Migrations

This directory contains scripts to migrate existing data to match new schema requirements.

## Available Migrations

### Add likedBy Field to Comments
Adds the `likedBy` field to existing comments in the database.

**When to run:** After deploying the one-like-per-user feature

**How to run:**
```bash
npm run migrate:add-liked-by
```

**What it does:**
- Adds an empty `likedBy` array to all comments that don't already have this field
- This ensures the new like functionality works correctly with existing data

**Note:** This migration is safe to run multiple times as it only updates comments that don't have the `likedBy` field.