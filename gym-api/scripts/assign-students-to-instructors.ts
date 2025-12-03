import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { Student } from '../src/entities/Student';

async function assignStudentsToInstructors() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const studentRepo = AppDataSource.getRepository(Student);

    // Get all students
    const students = await studentRepo.find();
    console.log(`\nFound ${students.length} students\n`);

    // Instructor IDs: 4 (Carlos), 5 (Maria), 6 (Roberto)
    const instructorIds = [4, 5, 6];

    let assignmentCount = 0;

    for (const student of students) {
      for (const instructorId of instructorIds) {
        // Create a new Student record for each student-instructor combination
        const assignment = studentRepo.create({
          userId: student.userId,
          instructorId: instructorId,
          planType: student.planType || 'basic',
          startDate: student.startDate,
          endDate: student.endDate,
          emergencyContactName: student.emergencyContactName,
          emergencyContactPhone: student.emergencyContactPhone,
          healthConditions: student.healthConditions,
          paymentStatus: student.paymentStatus,
          registrationDate: student.registrationDate,
          gender: student.gender,
          avatar: student.avatar,
        });
        await studentRepo.save(assignment);
        assignmentCount++;
      }
    }

    console.log(`✓ Total assignments created: ${assignmentCount}`);
    console.log(`  (${students.length} students × 3 instructors)\n`);

    // Show results
    console.log('========== VERIFICATION ==========\n');
    const allAssignments = await AppDataSource.createQueryBuilder()
      .select('u.id', 'student_id')
      .addSelect('u.name', 'student_name')
      .addSelect('s.instructor_id', 'instructor_id')
      .addSelect('ui.name', 'instructor_name')
      .from('users', 'u')
      .leftJoin('students', 's', 's.user_id = u.id')
      .leftJoin('users', 'ui', 'ui.id = s.instructor_id')
      .where('u.user_type = :type', { type: 'student' })
      .orderBy('u.name', 'ASC')
      .addOrderBy('s.instructor_id', 'ASC')
      .getRawMany();

    console.log('Student | Instructor');
    console.log('--------|----------');
    allAssignments.forEach((row: any) => {
      console.log(`${row.student_name} | ${row.instructor_name || 'None'}`);
    });

    await AppDataSource.destroy();
    console.log('\n✓ Done!\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignStudentsToInstructors();
