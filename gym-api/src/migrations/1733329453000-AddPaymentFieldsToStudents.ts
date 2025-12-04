import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentFieldsToStudents1733329453000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adiciona a coluna payment_method
        await queryRunner.addColumn(
            'students',
            new TableColumn({
                name: 'payment_method',
                type: 'varchar',
                length: '50',
                isNullable: true,
            })
        );

        // Adiciona a coluna amount_paid
        await queryRunner.addColumn(
            'students',
            new TableColumn({
                name: 'amount_paid',
                type: 'decimal',
                precision: 10,
                scale: 2,
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove as colunas na ordem inversa
        await queryRunner.dropColumn('students', 'amount_paid');
        await queryRunner.dropColumn('students', 'payment_method');
    }
}
