import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class UpdateWorkoutPlansTable1763050000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se a tabela já existe
    const tableExists = await queryRunner.hasTable('workout_plans');
    
    if (!tableExists) {
      // Se a tabela não existir, cria ela
      await queryRunner.createTable(
        new Table({
          name: 'workout_plans',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'student_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'instructor_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '100',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['active', 'inactive', 'paused', 'completed'],
              default: '"active"',
            },
            {
              name: 'start_date',
              type: 'date',
              isNullable: false,
            },
            {
              name: 'end_date',
              type: 'date',
              isNullable: true,
            },
            {
              name: 'exercises',
              type: 'json',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );

      // Adiciona as chaves estrangeiras
      await queryRunner.createForeignKey(
        'workout_plans',
        new TableForeignKey({
          columnNames: ['student_id'],
          referencedColumnNames: ['user_id'],
          referencedTableName: 'students',
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createForeignKey(
        'workout_plans',
        new TableForeignKey({
          columnNames: ['instructor_id'],
          referencedColumnNames: ['user_id'],
          referencedTableName: 'instructors',
          onDelete: 'CASCADE',
        }),
      );
    } else {
      // Se a tabela já existir, apenas adiciona a coluna exercises se ela não existir
      const table = await queryRunner.getTable('workout_plans');
      const exercisesColumn = table?.findColumnByName('exercises');
      
      if (!exercisesColumn) {
        await queryRunner.addColumn(
          'workout_plans',
          new TableColumn({
            name: 'exercises',
            type: 'json',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não remove a coluna exercises para evitar perda de dados
    // Apenas remove a tabela se ela existir e estiver vazia
    const tableExists = await queryRunner.hasTable('workout_plans');
    
    if (tableExists) {
      const hasData = await queryRunner.query('SELECT 1 FROM workout_plans LIMIT 1');
      
      if (!hasData || hasData.length === 0) {
        await queryRunner.dropTable('workout_plans');
      }
    }
  }
}
