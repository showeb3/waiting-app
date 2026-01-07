-- Check for demo store
SELECT * FROM stores WHERE slug = 'demo';

-- Ensure local-owner exists (we did this before, but good to be safe for foreign key)
-- Then insert demo store if not exists
INSERT OR IGNORE INTO stores (slug, name, ownerId, isOpen, settings)
VALUES (
  'demo',
  'Demo Store',
  (SELECT id FROM users WHERE openId = 'local-owner'),
  1,
  '{"notificationThreshold3":3,"notificationThreshold1":1,"skipRecoveryMode":"end","printMethod":"local_bridge","autoResetSeconds":5}'
);
