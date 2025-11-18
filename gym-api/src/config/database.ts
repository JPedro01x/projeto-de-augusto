import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Student } from "../entities/Student";
import { Instructor } from "../entities/Instructor";
import { Plan } from "../entities/Plan";
import { StudentPlan } from "../entities/StudentPlan";
import { Payment } from "../entities/Payment";
import { Attendance } from "../entities/Attendance";
import { WorkoutPlan } from "../entities/WorkoutPlan";
import { Notification } from "../entities/Notification";
import { GymSettings } from "../entities/GymSettings";
import { Treino } from "../entities/Treino";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Maiorde18.",
    database: "gym_management",
    synchronize: false, // Desativado para evitar conflitos com o esquema existente
    logging: true, // Ativado para ajudar no debug
    entities: [
        User,
        Student,
        Instructor,
        Plan,
        StudentPlan,
        Payment,
        Attendance,
        WorkoutPlan,
        Notification,
        GymSettings,
        Treino
    ],
    migrations: [
        "src/migrations/*.ts"
    ],
    subscribers: [],
});

// Para executar migrações via CLI
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => console.log("Data Source has been initialized!"))
    .catch((err) => console.error("Error during Data Source initialization", err));
}