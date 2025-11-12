-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS gym_management;
USE gym_management;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    user_type ENUM('admin', 'instructor', 'student') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
);

-- Tabela de instrutores
CREATE TABLE instructors (
    user_id INT PRIMARY KEY,
    specialty VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    certifications TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de alunos
CREATE TABLE students (
    user_id INT PRIMARY KEY,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    health_conditions TEXT,
    allergies TEXT,
    medical_restrictions TEXT,
    registration_date DATE NOT NULL,
    instructor_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(user_id) ON DELETE SET NULL
);

-- Tabela de planos
CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    benefits TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de assinaturas de alunos
CREATE TABLE student_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_student_plan (student_id, status)
);

-- Tabela de pagamentos
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_plan_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    receipt_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_plan_id) REFERENCES student_plans(id) ON DELETE CASCADE,
    INDEX idx_payment_status (status),
    INDEX idx_due_date (due_date)
);

-- Tabela de exercícios
CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50),
    equipment_needed VARCHAR(100),
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    video_url VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de treinos
CREATE TABLE workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    instructor_id INT NOT NULL,
    student_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    goal TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    INDEX idx_workout_status (status)
);

-- Tabela de itens do treino
CREATE TABLE workout_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL,
    repetitions VARCHAR(50) NOT NULL,
    weight DECIMAL(10, 2),
    rest_seconds INT,
    order_in_workout INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE KEY unique_workout_exercise_order (workout_id, exercise_id, order_in_workout)
);

-- Tabela de presença
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    status ENUM('present', 'absent', 'justified') DEFAULT 'present',
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_attendance_date (check_in)
);

-- Tabela de avaliações físicas
CREATE TABLE physical_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_date DATE NOT NULL,
    weight DECIMAL(5, 2),
    height DECIMAL(4, 2),
    bmi DECIMAL(5, 2),
    body_fat_percentage DECIMAL(5, 2),
    muscle_mass DECIMAL(5, 2),
    chest_circumference DECIMAL(5, 2),
    waist_circumference DECIMAL(5, 2),
    hip_circumference DECIMAL(5, 2),
    right_arm_circumference DECIMAL(5, 2),
    left_arm_circumference DECIMAL(5, 2),
    right_thigh_circumference DECIMAL(5, 2),
    left_thigh_circumference DECIMAL(5, 2),
    right_calf_circumference DECIMAL(5, 2),
    left_calf_circumference DECIMAL(5, 2),
    notes TEXT,
    next_assessment_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_assessment_date (assessment_date)
);

-- Tabela de despesas
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    receipt_url VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_expense_date (expense_date)
);

-- Tabela de notificações
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('payment', 'assessment', 'workout', 'system', 'other') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
);

-- Tabela de logs de auditoria
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at)
);

USE gym_management;

INSERT INTO users (name, email, password_hash, user_type, status, created_at, updated_at)
VALUES (
    'Administrador', 
    'admin@academia.com', 
    '$2a$10$XFDq3wNxQ9Q0Q9Q0Q9Q0QO9Q0Q9Q0Q9Q0Q9Q0Q9Q0Q9Q0Q9Q0Q9Q0Q9Q0Q0', -- senha: admin123 (hash bcrypt)
    'admin',
    'active',
    NOW(),
    NOW()
);

USE gym_management;

-- Ver os últimos alunos criados com seus dados de usuário
SELECT 
  s.user_id,
  u.name,
  u.email,
  u.cpf,
  u.phone,
  u.status,
  s.emergency_contact_name,
  s.registration_date
FROM students s
JOIN users u ON u.id = s.user_id
ORDER BY u.created_at DESC;


SELECT id, email, LENGTH(password_hash) AS hash_len
FROM users
WHERE user_type='student'
ORDER BY created_at DESC;
-- hash_len deve ser ~60


USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'sua_nova_senha';
FLUSH PRIVILEGES;