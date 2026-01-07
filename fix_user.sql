-- Check existing user
SELECT * FROM users WHERE openId = 'local-owner';

-- Upsert admin user to ensure it exists and has correct role
INSERT OR REPLACE INTO users (id, openId, name, role) 
VALUES (
  (SELECT id FROM users WHERE openId = 'local-owner'),
  'local-owner', 
  'Local Owner', 
  'admin'
);
