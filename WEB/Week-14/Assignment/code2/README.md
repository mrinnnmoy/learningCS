# How to Build.

```
Step 1 — Initialise the project
  mkdir code2 && cd code2
  npm init -y
  npm install express pg dotenv
  npm install --save-dev nodemon

Step 2 — Write schema.sql
  Three CREATE TABLE statements in dependency order:
    users first (no foreign keys),
    posts second (references users),
    comments third (references posts and users).
  Add indexes: CREATE INDEX on posts(author_id), comments(post_id), comments(user_id).

Step 3 — Create the database and run the schema
  psql -U postgres -c "CREATE DATABASE week14_medium;"
  psql -U postgres -d week14_medium -f schema.sql

Step 4 — Create .env and db.js (same pattern as Assignment 1)

Step 5 — Create models/user.js
  createUser(email, name) → INSERT RETURNING id, email, name.

Step 6 — Create models/post.js
  createPost(authorId, title, body, tags)
  getPosts({ tag, page, limit }) — JOIN users for author, subquery for comment count
  getPostById(id) — JOIN users, LEFT JOIN comments with commenter name, increment views in transaction
  deletePost(id)

Step 7 — Create models/comment.js
  createComment(postId, userId, body) — let FK constraint do validation, catch 23503

Step 8 — Create routes/ files and wire to server.js

Step 9 — Test the full flow in Postman
  Create 2 users → create 3 posts with tags → add comments → GET /api/posts?tag=postgresql
  Verify pagination, view increment, cascade delete.
```