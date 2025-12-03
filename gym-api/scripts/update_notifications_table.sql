-- 1. Remover a chave estrangeira existente se existir
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_ibfk_1;

-- 2. Remover o índice existente
DROP INDEX IF EXISTS idx_notification_user ON notifications;

-- 3. Renomear a coluna is_read para read
ALTER TABLE notifications CHANGE is_read `read` TINYINT(1) NOT NULL DEFAULT 0;

-- 4. Atualizar o tipo da coluna type
ALTER TABLE notifications 
MODIFY COLUMN type ENUM('payment', 'system', 'alert') NOT NULL DEFAULT 'system';

-- 5. Atualizar o tamanho da coluna title
ALTER TABLE notifications 
MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- 6. Adicionar a coluna updated_at se não existir
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 7. Recriar o índice
CREATE INDEX idx_notification_user ON notifications(user_id, `read`);

-- 8. Recriar a chave estrangeira
ALTER TABLE notifications 
ADD CONSTRAINT fk_notification_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;
