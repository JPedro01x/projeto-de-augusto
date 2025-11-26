import { AppDataSource } from '../src/config/database';
import { getRepository } from 'typeorm';

async function checkWorkouts() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    // Check workout_plans
    const workoutPlansResult = await AppDataSource.query('SELECT * FROM workout_plans');
    console.log('\n📋 Workout Plans:', workoutPlansResult.length);
    if (workoutPlansResult.length > 0) {
      console.log(workoutPlansResult);
    }

    // Check treinos
    const treinosResult = await AppDataSource.query('SELECT * FROM treinos');
    console.log('\n🏋️ Treinos:', treinosResult.length);
    if (treinosResult.length > 0) {
      console.log(treinosResult);
    }

    // Check tables exist
    const tables = await AppDataSource.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    console.log('\n📊 Tables:', tables.map((t: any) => t.TABLE_NAME).sort());

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkWorkouts();
