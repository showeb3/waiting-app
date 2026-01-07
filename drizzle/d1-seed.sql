-- Seed data for D1 database
-- Demo store and admin user

-- Insert admin user (using same openId as before for compatibility)
INSERT INTO users (openId, name, email, role, loginMethod)
VALUES ('local-owner', 'Local Admin', 'admin@example.com', 'admin', 'email');

-- Insert demo store
INSERT INTO stores (slug, name, nameEn, ownerId, isOpen)
VALUES ('demo', 'デモレストラン', 'Demo Restaurant', 1, 1);

-- Insert staff assignment
INSERT INTO staffAssignments (userId, storeId, role)
VALUES (1, 1, 'admin');
