import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateStudentInstructorTable1732604400000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create junction table for many-to-many relationship
        await queryRunner.createTable(
            new Table({
                name: "student_instructors",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "student_id",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "instructor_id",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "assigned_date",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    }
                ],
                indices: [
                    {
                        columnNames: ["student_id", "instructor_id"],
                        isUnique: true
                    }
                ]
            }),
            true
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            "student_instructors",
            new TableForeignKey({
                columnNames: ["student_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "students",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "student_instructors",
            new TableForeignKey({
                columnNames: ["instructor_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "instructors",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("student_instructors");
    }
}
