import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Student } from "../entities/Student";
import { Instructor } from "../entities/Instructor";
import { Plan } from "../entities/Plan";
import { StudentPlan } from "../entities/StudentPlan";
import { Payment } from "../entities/Payment";
import { Attendance } from "../entities/Attendance";
import { WorkoutPlan } from "../entities/WorkoutPlan";
import { Exercise } from "../entities/Exercise";
import { Workout } from "../entities/Workout";
import { WorkoutItem } from "../entities/WorkoutItem";
import { PhysicalAssessment } from "../entities/PhysicalAssessment";
import { Expense } from "../entities/Expense";
import { Notification } from "../entities/Notification";
import { AuditLog } from "../entities/AuditLog";
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
    // No arquivo database.ts, substitua a lista de entidades por:
entities: [
    User,
    Student,
    Instructor,
    Plan,
    StudentPlan,
    Payment,
    Attendance,
    WorkoutPlan
],
    migrations: [],
    subscribers: [],
});