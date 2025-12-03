import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

async function verifyAssignments() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const results = await AppDataSource.createQueryBuilder()
      .select('u.name', 'student_name')
      .addSelect('ui.name', 'instructor_name')
      .from('users', 'u')
      .leftJoin('students', 's', 's.user_id = u.id')
      .leftJoin('users', 'ui', 'ui.id = s.instructor_id')
      .where('u.user_type = :type', { type: 'student' })
      .orderBy('u.name', 'ASC')
      .addOrderBy('ui.name', 'ASC')
      .getRawMany();

    console.log('\n========== FINAL VERIFICATION ==========\n');
    console.log(`Total Assignments: ${results.length}\n`);
    console.log('Student Name | Instructor Name');
    console.log('-------------|----------------');

    results.forEach((row: any) => {
      console.log(`${row.student_name.padEnd(12)} | ${row.instructor_name || 'Not assigned'}`);
    });

    await AppDataSource.destroy();
    console.log('\n✓ Done!\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAssignments();
