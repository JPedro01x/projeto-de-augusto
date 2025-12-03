import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTreinosTable1762969500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'treinos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'exercicios',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'aluno_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'instrutor_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'data_criacao',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'data_atualizacao',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'treinos',
      new TableForeignKey({
        columnNames: ['aluno_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'treinos',
      new TableForeignKey({
        columnNames: ['instrutor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('treinos');
    
    if (table) {
      const foreignKeyAluno = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('aluno_id') !== -1,
      );
      const foreignKeyInstrutor = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('instrutor_id') !== -1,
      );

      if (foreignKeyAluno) {
        await queryRunner.dropForeignKey('treinos', foreignKeyAluno);
      }
      if (foreignKeyInstrutor) {
        await queryRunner.dropForeignKey('treinos', foreignKeyInstrutor);
      }

      await queryRunner.dropTable('treinos');
    }
  }
}
