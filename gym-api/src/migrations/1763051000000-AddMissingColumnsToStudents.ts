import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingColumnsToStudents1763051000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se a tabela existe
    const studentsTable = await queryRunner.getTable('students');
    if (!studentsTable) {
      console.log('A tabela students não existe.');
      return;
    }
    
    // Verifica se a coluna já existe para evitar erros
    if (!studentsTable.findColumnByName('plan_type')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'plan_type',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    if (!studentsTable.findColumnByName('start_date')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'start_date',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    if (!studentsTable.findColumnByName('end_date')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'end_date',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    if (!studentsTable.findColumnByName('payment_status')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'payment_status',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    if (!studentsTable.findColumnByName('last_payment_date')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'last_payment_date',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    if (!studentsTable.findColumnByName('next_payment_date')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'next_payment_date',
          type: 'date',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não remova as colunas para evitar perda de dados
    // Esta é uma boa prática em produção
    console.log('A migração de rollback não remove as colunas adicionadas para evitar perda de dados.');
  }
}
