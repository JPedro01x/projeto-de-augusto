import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { User } from '../src/entities/User';
import { Student } from '../src/entities/Student';

async function checkDatabase() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('\n========== STUDENTS AND INSTRUCTORS ==========\n');

    // Query students with their instructors
    const query = AppDataSource.createQueryBuilder()
      .select('u.id', 'student_id')
      .addSelect('u.name', 'student_name')
      .addSelect('u.email', 'student_email')
      .addSelect('s.instructor_id', 'instructor_id')
      .addSelect('ui.name', 'instructor_name')
      .from(User, 'u')
      .leftJoin(Student, 's', 's.user_id = u.id')
      .leftJoin(User, 'ui', 'ui.id = s.instructor_id')
      .where('u.user_type = :type', { type: 'student' })
      .orderBy('u.name', 'ASC');

    const results = await query.getRawMany();

    console.log(`Total Students: ${results.length}\n`);
    console.log('ID | Name | Email | Instructor ID | Instructor Name');
    console.log('---+------+-------+---------------+----------------');

    results.forEach((row: any) => {
      console.log(
        `${row.student_id} | ${row.student_name} | ${row.student_email} | ${row.instructor_id || 'None'} | ${row.instructor_name || 'Not assigned'}`
      );
    });

    console.log('\n========== ALL USERS ==========\n');

    const allUsers = await AppDataSource.getRepository(User).find();
    console.log(`Total Users: ${allUsers.length}\n`);
    console.log('ID | Name | Email | Type');
    console.log('---+------+-------+-----');

    allUsers.forEach((user: User) => {
      console.log(`${user.id} | ${user.name} | ${user.email} | ${user.userType}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
