import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInstructorEntity1764000000000 implements MigrationInterface {
    name = 'UpdateInstructorEntity1764000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adiciona colunas à tabela instructors
        await queryRunner.query(`ALTER TABLE "instructors" 
            ADD COLUMN IF NOT EXISTS "phone" varchar(20),
            ADD COLUMN IF NOT EXISTS "bio" text,
            ADD COLUMN IF NOT EXISTS "photo_url" varchar(255),
            ADD COLUMN IF NOT EXISTS "specialization" varchar(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instructors" 
            DROP COLUMN IF EXISTS "phone",
            DROP COLUMN IF EXISTS "bio",
            DROP COLUMN IF EXISTS "photo_url",
            DROP COLUMN IF EXISTS "specialization"`);
    }
}
