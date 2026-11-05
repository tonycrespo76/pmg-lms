INSERT INTO pmg_users (email, name, role)
VALUES ('admin@example.com', 'PMG Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
