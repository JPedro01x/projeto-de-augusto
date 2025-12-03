import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

async function populateStudentInstructors() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('\n========== POPULATING STUDENT-INSTRUCTOR JUNCTION ==========\n');

    // Get all students and instructors
    const students = await AppDataSource.query('SELECT user_id FROM students');
    const instructors = await AppDataSource.query('SELECT user_id FROM instructors');

    console.log(`Found ${students.length} students and ${instructors.length} instructors\n`);

    // Clear existing assignments
    await AppDataSource.query('DELETE FROM student_instructors');
    console.log('Cleared existing assignments\n');

    // Create assignments: each student with each instructor
    let assignmentCount = 0;
    for (const student of students) {
      for (const instructor of instructors) {
        await AppDataSource.query(
          'INSERT INTO student_instructors (student_id, instructor_id) VALUES (?, ?)',
          [student.user_id, instructor.user_id]
        );
        assignmentCount++;
      }
    }

    console.log(`✓ Created ${assignmentCount} assignments\n`);

    // Verify
    const result = await AppDataSource.query(`
      SELECT 
        u.name as student_name,
        ui.name as instructor_name
      FROM student_instructors si
      JOIN students s ON si.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      JOIN instructors i ON si.instructor_id = i.user_id
      JOIN users ui ON i.user_id = ui.id
      ORDER BY u.name, ui.name
    `);

    console.log('========== VERIFICATION ==========\n');
    console.log(`Total Assignments: ${result.length}\n`);
    console.log('Student Name | Instructor Name');
    console.log('-------------|----------------');

    result.forEach((row: any) => {
      console.log(`${String(row.student_name).padEnd(12)} | ${row.instructor_name}`);
    });

    await AppDataSource.destroy();
    console.log('\n✓ Done!\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populateStudentInstructors();
