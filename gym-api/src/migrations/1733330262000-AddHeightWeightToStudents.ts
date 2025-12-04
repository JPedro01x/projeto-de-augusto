import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHeightWeightToStudents1733330262000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adiciona a coluna height (altura em metros)
        await queryRunner.addColumn(
            'students',
            new TableColumn({
                name: 'height',
                type: 'decimal',
                precision: 5,
                scale: 2,
                isNullable: true,
                comment: 'Altura do aluno em metros (ex: 1.75)',
            })
        );

        // Adiciona a coluna weight (peso em kg)
        await queryRunner.addColumn(
            'students',
            new TableColumn({
                name: 'weight',
                type: 'decimal',
                precision: 5,
                scale: 2,
                isNullable: true,
                comment: 'Peso do aluno em quilogramas (ex: 70.5)',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove as colunas na ordem inversa
        await queryRunner.dropColumn('students', 'weight');
        await queryRunner.dropColumn('students', 'height');
    }
}
