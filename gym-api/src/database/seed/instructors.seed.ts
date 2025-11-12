import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { Instructor } from '../../entities/Instructor';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const instructorsData = [
  {
    name: 'Carlos Silva',
    email: 'carlos@gmail.com',
    password: 'Senha123@', // Senha padrão que deve ser alterada no primeiro login
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    specialty: 'Musculação e Hipertrofia',
    hireDate: '2023-01-15',
    salary: 3500.00,
    certifications: 'CREF 123456 – Personal Trainer',
    schedule: 'Segunda a Sexta – 06:00 às 12:00'
  },
  {
    name: 'Maria Santos',
    email: 'maria@gmail.com',
    password: 'Senha123@', // Senha padrão que deve ser alterada no primeiro login
    cpf: '987.654.321-00',
    phone: '(11) 91234-5678',
    specialty: 'Crossfit e Condicionamento',
    hireDate: '2023-02-20',
    salary: 3800.00,
    certifications: 'CREF 789012 – CrossFit Level 2',
    schedule: 'Segunda a Sexta – 14:00 às 20:00'
  },
  {
    name: 'Roberto Lima',
    email: 'roberto@gmail.com',
    password: 'Senha123@', // Senha padrão que deve ser alterada no primeiro login
    cpf: '456.789.123-00',
    phone: '(11) 99876-5432',
    specialty: 'Treinamento Funcional',
    hireDate: '2023-03-10',
    salary: 3200.00,
    certifications: 'CREF 345678 – TRX Certification',
    schedule: 'Terça e Quinta – 18:00 às 22:00'
  }
];

export async function seedInstructors() {
  console.log('Iniciando seed de instrutores...');
  
  const userRepository = AppDataSource.getRepository(User);
  const instructorRepository = AppDataSource.getRepository(Instructor);
  
  for (const instructorData of instructorsData) {
    // Verifica se o usuário já existe
    const existingUser = await userRepository.findOne({ where: { email: instructorData.email } });
    
    if (!existingUser) {
      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(instructorData.password, SALT_ROUNDS);
      
      // Cria o usuário
      const user = new User();
      user.name = instructorData.name;
      user.email = instructorData.email;
      user.passwordHash = hashedPassword;
      user.cpf = instructorData.cpf;
      user.phone = instructorData.phone;
      user.userType = 'instructor';
      user.status = 'active';
      
      // Salva o usuário
      const savedUser = await userRepository.save(user);
      
      // Cria o instrutor
      const instructor = new Instructor();
      instructor.userId = savedUser.id;
      instructor.specialty = instructorData.specialty;
      instructor.hireDate = new Date(instructorData.hireDate);
      instructor.salary = instructorData.salary;
      instructor.certifications = instructorData.certifications;
      
      // Salva o instrutor
      await instructorRepository.save(instructor);
      
      console.log(`Instrutor ${instructorData.name} criado com sucesso!`);
    } else {
      console.log(`Instrutor com email ${instructorData.email} já existe.`);
    }
  }
  
  console.log('Seed de instrutores concluído!');
}

// Executa o seed se o arquivo for executado diretamente
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedInstructors())
    .catch(error => console.error('Erro ao executar o seed:', error));
}
