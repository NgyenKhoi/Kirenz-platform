--liquibase formatted sql

--changeset identity-service:004-add-account-suspension-columns
ALTER TABLE users ADD COLUMN suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN moderation_reason VARCHAR(255);
--rollback ALTER TABLE users DROP COLUMN IF EXISTS moderation_reason; ALTER TABLE users DROP COLUMN IF EXISTS suspended_until;

--changeset identity-service:004-replace-account-status-check splitStatements:false
DO $$
DECLARE constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%';
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;
--rollback SELECT 1;

--changeset identity-service:004-add-account-status-check
ALTER TABLE users ADD CONSTRAINT chk_users_status
    CHECK (status IN ('ACTIVE', 'BANNED', 'SUSPENDED', 'DEACTIVATED'));
CREATE INDEX idx_users_suspended_until ON users(suspended_until) WHERE status = 'SUSPENDED';

--rollback DROP INDEX IF EXISTS idx_users_suspended_until; ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_status;
