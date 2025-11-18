import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class UpdateNotificationsTable1763051000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, removemos a chave estrangeira existente se existir
    const table = await queryRunner.getTable('notifications');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('user_id') !== -1,
      );
      
      if (foreignKey) {
        await queryRunner.dropForeignKey('notifications', foreignKey);
      }
    }

    // Alteramos a tabela para corresponder à nossa entidade
    await queryRunner.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM('payment', 'system', 'alert') NOT NULL DEFAULT 'system',
      MODIFY COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0,
      MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      MODIFY COLUMN title VARCHAR(255) NOT NULL,
      CHANGE is_read read TINYINT(1) NOT NULL DEFAULT 0;
    `);

    // Recriamos a chave estrangeira
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter as alterações se necessário
    await queryRunner.query(`
      ALTER TABLE notifications
      MODIFY COLUMN type ENUM('payment','assessment','workout','system','other') NOT NULL DEFAULT 'system',
      CHANGE read is_read TINYINT(1) NOT NULL DEFAULT 0,
      DROP COLUMN IF EXISTS updated_at,
      MODIFY COLUMN title VARCHAR(100) NOT NULL;
    `);
  }
}
