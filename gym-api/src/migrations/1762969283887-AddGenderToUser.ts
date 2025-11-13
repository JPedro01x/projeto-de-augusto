import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderToUser1762969283887 implements MigrationInterface {
    name = 'AddGenderToUser1762969283887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`gender\` varchar(20) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`gender\``);
    }
}