import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumnsToStudent1700000000000 implements MigrationInterface {
    name = 'AddMissingColumnsToStudent1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verifica se a coluna 'avatar' já existe antes de adicioná-la
        const avatarColumn = await queryRunner.hasColumn('students', 'avatar');
        if (!avatarColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN avatar VARCHAR(255) NULL`);
        }

        // Verifica se a coluna 'plan_type' já existe antes de adicioná-la
        const planTypeColumn = await queryRunner.hasColumn('students', 'plan_type');
        if (!planTypeColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN plan_type VARCHAR(50) NULL`);
        }

        // Verifica se a coluna 'start_date' já existe antes de adicioná-la
        const startDateColumn = await queryRunner.hasColumn('students', 'start_date');
        if (!startDateColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN start_date DATE NULL`);
        }

        // Verifica se a coluna 'end_date' já existe antes de adicioná-la
        const endDateColumn = await queryRunner.hasColumn('students', 'end_date');
        if (!endDateColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN end_date DATE NULL`);
        }

        // Verifica se a coluna 'payment_status' já existe antes de adicioná-la
        const paymentStatusColumn = await queryRunner.hasColumn('students', 'payment_status');
        if (!paymentStatusColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN payment_status VARCHAR(50) NULL`);
        }

        // Verifica se a coluna 'last_payment_date' já existe antes de adicioná-la
        const lastPaymentDateColumn = await queryRunner.hasColumn('students', 'last_payment_date');
        if (!lastPaymentDateColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN last_payment_date DATE NULL`);
        }

        // Verifica se a coluna 'next_payment_date' já existe antes de adicioná-la
        const nextPaymentDateColumn = await queryRunner.hasColumn('students', 'next_payment_date');
        if (!nextPaymentDateColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN next_payment_date DATE NULL`);
        }

        // Verifica se a coluna 'gender' já existe antes de adicioná-la
        const genderColumn = await queryRunner.hasColumn('students', 'gender');
        if (!genderColumn) {
            await queryRunner.query(`ALTER TABLE students ADD COLUMN gender VARCHAR(20) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as alterações se necessário
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS avatar`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS plan_type`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS start_date`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS end_date`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS payment_status`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS last_payment_date`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS next_payment_date`);
        await queryRunner.query(`ALTER TABLE students DROP COLUMN IF EXISTS gender`);
    }
}
