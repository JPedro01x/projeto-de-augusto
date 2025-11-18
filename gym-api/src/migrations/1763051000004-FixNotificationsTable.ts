import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNotificationsTable1763051000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remover a chave estrangeira existente
    await queryRunner.query(`
      ALTER TABLE notifications DROP FOREIGN KEY notifications_ibfk_1;
    `);

    // 2. Remover o índice existente
    await queryRunner.query(`
      DROP INDEX idx_notification_user ON notifications;
    `);

    // 3. Renomear a coluna is_read para read
    await queryRunner.query(`
      ALTER TABLE notifications CHANGE is_read read TINYINT(1) NOT NULL DEFAULT 0;
    `);

    // 4. Atualizar o tipo da coluna type
    await queryRunner.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM('payment', 'system', 'alert') NOT NULL DEFAULT 'system';
    `);

    // 5. Atualizar o tamanho da coluna title
    await queryRunner.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN title VARCHAR(255) NOT NULL;
    `);

    // 6. Adicionar a coluna updated_at
    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);

    // 7. Recriar o índice
    await queryRunner.query(`
      CREATE INDEX idx_notification_user ON notifications(user_id, read);
    `);

    // 8. Recriar a chave estrangeira
    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT fk_notification_user 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter as alterações se necessário
    await queryRunner.query(`
      ALTER TABLE notifications DROP FOREIGN KEY fk_notification_user;
    `);

    await queryRunner.query(`
      DROP INDEX idx_notification_user ON notifications;
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM('payment','assessment','workout','system','other') NOT NULL DEFAULT 'system';
    `);

    await queryRunner.query(`
      ALTER TABLE notifications CHANGE read is_read TINYINT(1) NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      DROP COLUMN updated_at;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_notification_user ON notifications(user_id, is_read);
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT notifications_ibfk_1 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE CASCADE;
    `);
  }
}
