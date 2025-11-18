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


DESCRIBE instructors;





-- Script para adicionar instrutores ao banco de dados
-- Senha padrão: Senha123@ (já com hash)

-- Inserir usuários dos instrutores
INSERT INTO users (name, email, password_hash, cpf, phone, user_type, status) VALUES
-- Carlos Silva
(
    'Carlos Silva',
    'carlos@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Senha123@
    '123.456.789-00',
    '(11) 98765-4321',
    'instructor',
    'active'
),
-- Maria Santos
(
    'Maria Santos',
    'maria@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Senha123@
    '987.654.321-00',
    '(11) 91234-5678',
    'instructor',
    'active'
),
-- Roberto Lima
(
    'Roberto Lima',
    'roberto@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Senha123@
    '456.789.123-00',
    '(11) 99876-5432',
    'instructor',
    'active'
);

-- Inserir os dados específicos dos instrutores
-- OBS: Substitua os IDs pelos IDs reais gerados na inserção anterior
INSERT INTO instructors (user_id, specialty, hire_date, salary, certifications)
SELECT 
    id,
    CASE 
        WHEN email = 'carlos@gmail.com' THEN 'Musculação e Hipertrofia'
        WHEN email = 'maria@gmail.com' THEN 'Crossfit e Condicionamento'
        WHEN email = 'roberto@gmail.com' THEN 'Treinamento Funcional'
    END as specialty,
    CASE 
        WHEN email = 'carlos@gmail.com' THEN '2023-01-15'
        WHEN email = 'maria@gmail.com' THEN '2023-02-20'
        WHEN email = 'roberto@gmail.com' THEN '2023-03-10'
    END as hire_date,
    CASE 
        WHEN email = 'carlos@gmail.com' THEN 3500.00
        WHEN email = 'maria@gmail.com' THEN 3800.00
        WHEN email = 'roberto@gmail.com' THEN 3200.00
    END as salary,
    CASE 
        WHEN email = 'carlos@gmail.com' THEN 'CREF 123456, Personal Trainer'
        WHEN email = 'maria@gmail.com' THEN 'CREF 789012, CrossFit Level 2'
        WHEN email = 'roberto@gmail.com' THEN 'CREF 345678, TRX Certification'
    END as certifications
FROM users 
WHERE email IN ('carlos@gmail.com', 'maria@gmail.com', 'roberto@gmail.com')
AND user_type = 'instructor';

-- Atualizar a data de criação para refletir a data de contratação
UPDATE users u
JOIN instructors i ON u.id = i.user_id
SET u.created_at = i.hire_date
WHERE u.email IN ('carlos@gmail.com', 'maria@gmail.com', 'roberto@gmail.com');

-- Verificar os dados inseridos
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    i.specialty,
    i.hire_date,
    i.salary,
    i.certifications,
    u.status
FROM 
    users u
JOIN 
    instructors i ON u.id = i.user_id
WHERE 
    u.email IN ('carlos@gmail.com', 'maria@gmail.com', 'roberto@gmail.com');
    
ALTER TABLE students ADD COLUMN avatar VARCHAR(255) NULL;


-- =============================================
-- ADIÇÃO DE EXERCÍCIOS
-- =============================================

-- Inserir exercícios
INSERT INTO exercises (name, description, muscle_group, difficulty, created_at, updated_at) VALUES
-- Exercícios para Peito e Tríceps
('Supino Reto', 'Deitado no banco, segure a barra com as mãos afastadas na largura dos ombros e empurre para cima', 'Peitoral', 'intermediate', NOW(), NOW()),
('Supino Inclinado', 'Deitado em banco inclinado, segure a barra e empurre para cima', 'Peitoral Superior', 'intermediate', NOW(), NOW()),
('Crucifixo', 'Deitado no banco, com halteres, abra os braços em um movimento de abraço', 'Peitoral', 'beginner', NOW(), NOW()),
('Tríceps Testa', 'Deitado no banco, segure a barra com as mãos próximas e desça em direção à testa', 'Tríceps', 'intermediate', NOW(), NOW()),
-- Exercícios para Costas e Bíceps
('Puxada Frontal', 'Sentado no aparelho, puxe a barra em direção ao peito', 'Costas', 'beginner', NOW(), NOW()),
('Remada Curvada', 'Inclinado para frente, puxe a barra em direção à cintura', 'Costas', 'intermediate', NOW(), NOW()),
('Rosca Direta', 'Em pé, com halteres ou barra, flexione os cotovelos levantando o peso', 'Bíceps', 'beginner', NOW(), NOW()),
-- Exercícios para Full Body
('Agachamento', 'Pés na largura dos ombros, desça como se fosse sentar', 'Pernas', 'beginner', NOW(), NOW()),
('Flexão', 'Apoie as mãos no chão e desça o corpo mantendo-o reto', 'Peitoral, Tríceps', 'beginner', NOW(), NOW()),
('Burpee', 'Agache, coloque as mãos no chão, jogue os pés para trás, faça uma flexão, pule para frente e salte', 'Corpo Inteiro', 'advanced', NOW(), NOW());

-- =============================================
-- ADIÇÃO DE TREINOS
-- =============================================

-- Obter IDs dos instrutores e alunos
SET @carlos_id = (SELECT id FROM users WHERE email = 'carlos@gmail.com');
SET @maria_id = (SELECT id FROM users WHERE email = 'maria@gmail.com');
SET @joao_id = (SELECT id FROM users WHERE name = 'João Silva' LIMIT 1);
SET @maria_aluno_id = (SELECT id FROM users WHERE name = 'Maria Santos' AND user_type = 'student' LIMIT 1);
SET @pedro_id = (SELECT id FROM users WHERE name = 'Pedro Costa' LIMIT 1);

-- Se os alunos não existirem, insira-os
INSERT IGNORE INTO users (name, email, password_hash, user_type, status, created_at, updated_at) VALUES
('João Silva', 'joao@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active', NOW(), NOW()),
('Maria Santos', 'mariastudant@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active', NOW(), NOW()),
('Pedro Costa', 'pedro@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active', NOW(), NOW());

-- Inserir alunos na tabela students se não existirem
INSERT IGNORE INTO students (user_id, registration_date, instructor_id)
SELECT id, CURDATE(), @carlos_id FROM users WHERE email = 'joao@gmail' AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = (SELECT id FROM users WHERE email = 'joao@gmail'));

INSERT IGNORE INTO students (user_id, registration_date, instructor_id)
SELECT id, CURDATE(), @carlos_id FROM users WHERE email = 'mariastudant@email.com' AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = (SELECT id FROM users WHERE email = 'mariastudant@email.com'));

INSERT IGNORE INTO students (user_id, registration_date, instructor_id)
SELECT id, CURDATE(), @maria_id FROM users WHERE email = 'pedro@gmail.com' AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = (SELECT id FROM users WHERE email = 'pedro@gmail.com'));

-- Atualizar variáveis com os IDs corretos
SET @joao_id = (SELECT id FROM users WHERE email = 'joao@gmail.com');
SET @maria_aluno_id = (SELECT id FROM users WHERE email = 'mariastudant@email.com');
SET @pedro_id = (SELECT id FROM users WHERE email = 'pedro@gmail.com');

-- Inserir treinos
INSERT INTO workouts (name, description, instructor_id, student_id, start_date, end_date, status, goal, notes) VALUES
('Treino A - Peito e Tríceps', 'Treino focado em desenvolvimento de peitoral e tríceps', @carlos_id, @joao_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active', 'Hipertrofia', 'Focar na execução correta dos movimentos'),
('Treino B - Costas e Bíceps', 'Treino para desenvolvimento de costas e bíceps', @carlos_id, @maria_aluno_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active', 'Hipertrofia', 'Manter a coluna alinhada durante os exercícios'),
('Treino Full Body', 'Treino completo para todo o corpo', @maria_id, @pedro_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active', 'Funcional', 'Manter o ritmo constante durante todo o treino');

-- Obter IDs dos treinos recém-criados
SET @treino_a_id = (SELECT id FROM workouts WHERE name = 'Treino A - Peito e Tríceps');
SET @treino_b_id = (SELECT id FROM workouts WHERE name = 'Treino B - Costas e Bíceps');
SET @treino_full_id = (SELECT id FROM workouts WHERE name = 'Treino Full Body');

-- Obter IDs dos exercícios
SET @supino_reto_id = (SELECT id FROM exercises WHERE name = 'Supino Reto');
SET @supino_inclinado_id = (SELECT id FROM exercises WHERE name = 'Supino Inclinado');
SET @crucifixo_id = (SELECT id FROM exercises WHERE name = 'Crucifixo');
SET @triceps_testa_id = (SELECT id FROM exercises WHERE name = 'Tríceps Testa');
SET @puxada_frontal_id = (SELECT id FROM exercises WHERE name = 'Puxada Frontal');
SET @remada_curvada_id = (SELECT id FROM exercises WHERE name = 'Remada Curvada');
SET @rosca_direta_id = (SELECT id FROM exercises WHERE name = 'Rosca Direta');
SET @agachamento_id = (SELECT id FROM exercises WHERE name = 'Agachamento');
SET @flexao_id = (SELECT id FROM exercises WHERE name = 'Flexão');
SET @burpee_id = (SELECT id FROM exercises WHERE name = 'Burpee');

-- Inserir itens do Treino A - Peito e Tríceps
INSERT INTO workout_items (workout_id, exercise_id, sets, repetitions, weight, rest_seconds, order_in_workout, notes) VALUES
(@treino_a_id, @supino_reto_id, 4, '12', 40.0, 60, 1, 'Manter as costas apoiadas no banco'),
(@treino_a_id, @supino_inclinado_id, 3, '12', 35.0, 60, 2, 'Banco em 30 graus'),
(@treino_a_id, @crucifixo_id, 3, '15', 12.0, 45, 3, 'Controle o movimento na descida'),
(@treino_a_id, @triceps_testa_id, 3, '12', 20.0, 60, 4, 'Manter os cotovelos parados');

-- Inserir itens do Treino B - Costas e Bíceps
INSERT INTO workout_items (workout_id, exercise_id, sets, repetitions, weight, rest_seconds, order_in_workout, notes) VALUES
(@treino_b_id, @puxada_frontal_id, 4, '12', 50.0, 60, 1, 'Puxar a barra em direção ao peito'),
(@treino_b_id, @remada_curvada_id, 4, '10', 30.0, 50, 2, 'Manter as costas retas'),
(@treino_b_id, @rosca_direta_id, 3, '12', 15.0, 60, 3, 'Não balançar o corpo');

-- Inserir itens do Treino Full Body
INSERT INTO workout_items (workout_id, exercise_id, sets, repetitions, weight, rest_seconds, order_in_workout, notes) VALUES
(@treino_full_id, @agachamento_id, 4, '15', 0, 90, 1, 'Manter as costas retas e descer até 90 graus'),
(@treino_full_id, @flexao_id, 3, '15', 0, 60, 2, 'Manter o corpo alinhado'),
(@treino_full_id, @burpee_id, 3, '10', 0, 60, 3, 'Manter o ritmo constante');



	USE gym_management;
	DESCRIBE notifications;

DESCRIBE notifications;

-- 1. Remover a chave estrangeira existente se existir
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_ibfk_1;

-- 2. Remover o índice existente
DROP INDEX IF EXISTS idx_notification_user ON notifications;

-- 3. Renomear a coluna is_read para read
ALTER TABLE notifications CHANGE is_read `read` TINYINT(1) NOT NULL DEFAULT 0;

-- 4. Atualizar o tipo da coluna type
ALTER TABLE notifications 
MODIFY COLUMN type ENUM('payment', 'system', 'alert') NOT NULL DEFAULT 'system';

-- 5. Atualizar o tamanho da coluna title
ALTER TABLE notifications 
MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- 6. Adicionar a coluna updated_at se não existir
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 7. Recriar o índice
CREATE INDEX idx_notification_user ON notifications(user_id, `read`);

-- 8. Recriar a chave estrangeira
ALTER TABLE notifications 
ADD CONSTRAINT fk_notification_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS `gym_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `sms_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir configurações padrão
INSERT INTO `gym_settings` (`name`, `email`, `phone`, `address`, `email_notifications`, `sms_notifications`, `push_notifications`)
VALUES ('GymTech Pro', 'contato@exemplo.com', NULL, NULL, 1, 0, 1);