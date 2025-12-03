import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateGymSettingsTable1763210372178 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'gym_settings',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'address',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'email_notifications',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'sms_notifications',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'push_notifications',
                        type: 'boolean',
                        default: true,
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

        // Inserir configurações padrão
        await queryRunner.query(`
            INSERT INTO gym_settings (name, email, phone, address, email_notifications, sms_notifications, push_notifications)
            VALUES ('GymTech Pro', 'contato@exemplo.com', NULL, NULL, true, false, true);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('gym_settings');
    }
}
