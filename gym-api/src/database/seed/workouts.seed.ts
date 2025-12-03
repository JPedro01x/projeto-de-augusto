import { AppDataSource } from '../../config/database';
import { WorkoutPlan, Exercise } from '../../entities/WorkoutPlan';
import { User } from '../../entities/User';
import { Student } from '../../entities/Student';
import { Instructor } from '../../entities/Instructor';

export async function seedWorkouts() {
  console.log('Iniciando seed de treinos...');
  
  const userRepository = AppDataSource.getRepository(User);
  const studentRepository = AppDataSource.getRepository(Student);
  const instructorRepository = AppDataSource.getRepository(Instructor);
  const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);

  // Buscar instrutores existentes
  const [carlos, maria] = await Promise.all([
    instructorRepository.findOne({ where: { user: { email: 'carlos@gmail.com' } }, relations: ['user'] }),
    instructorRepository.findOne({ where: { user: { email: 'maria@gmail.com' } }, relations: ['user'] }),
  ]);

  // Buscar alunos existentes ou criá-los
  let joao = await studentRepository.findOne({ where: { user: { email: 'joao@gmail.com' } }, relations: ['user'] });
  let mariaAluno = await studentRepository.findOne({ where: { user: { email: 'maria.santos@example.com' } }, relations: ['user'] });
  let pedro = await studentRepository.findOne({ where: { user: { email: 'pedro@example.com' } }, relations: ['user'] });

  // Se não encontrar os alunos, cria alguns alunos de exemplo
  if (!joao) {
    const userJoao = userRepository.create({
      name: 'João Silva',
      email: 'joao@gmail.com',
      passwordHash: 'senha123', // Em um caso real, isso deveria ser uma hash
      cpf: '111.222.333-44',
      phone: '(11) 99999-9999',
      userType: 'student',
    });
    await userRepository.save(userJoao);
    
    joao = studentRepository.create({
      user: userJoao,
      registrationDate: new Date(),
    });
    await studentRepository.save(joao);
    console.log('Aluno João criado com sucesso!');
  }

  if (!mariaAluno) {
    const userMaria = userRepository.create({
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      passwordHash: 'senha123',
      cpf: '222.333.444-55',
      phone: '(11) 98888-8888',
      userType: 'student',
    });
    await userRepository.save(userMaria);
    
    mariaAluno = studentRepository.create({
      user: userMaria,
      registrationDate: new Date(),
    });
    await studentRepository.save(mariaAluno);
    console.log('Aluna Maria criada com sucesso!');
  }

  if (!pedro) {
    const userPedro = userRepository.create({
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      passwordHash: 'senha123',
      cpf: '333.444.555-66',
      phone: '(11) 97777-7777',
      userType: 'student',
    });
    await userRepository.save(userPedro);
    
    pedro = studentRepository.create({
      user: userPedro,
      registrationDate: new Date(),
    });
    await studentRepository.save(pedro);
    console.log('Aluno Pedro criado com sucesso!');
  }

  // Verificar se os treinos já existem
  const existingWorkouts = await workoutPlanRepository.find();
  if (existingWorkouts.length > 0) {
    console.log('Já existem treinos cadastrados. Nenhum novo treino foi adicionado.');
    return;
  }

  // Criar os treinos
  const treinos = [
    {
      title: 'Treino A - Peito e Tríceps',
      description: 'Treino focado em peitoral e tríceps',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      student: joao,
      instructor: carlos,
      exercises: [
        { nome: 'Supino Reto', series: 4, repeticoes: '12', descanso: '60s' },
        { nome: 'Supino Inclinado', series: 3, repeticoes: '12', descanso: '60s' },
        { nome: 'Crucifixo', series: 3, repeticoes: '15', descanso: '45s' },
        { nome: 'Tríceps Testa', series: 3, repeticoes: '12', descanso: '60s' }
      ]
    },
    {
      title: 'Treino B - Costas e Bíceps',
      description: 'Treino focado em costas e bíceps',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      student: mariaAluno,
      instructor: carlos,
      exercises: [
        { nome: 'Puxada Frontal', series: 4, repeticoes: '12', descanso: '60s' },
        { nome: 'Remada Curvada', series: 4, repeticoes: '10', descanso: '50s' },
        { nome: 'Rosca Direta', series: 3, repeticoes: '12', descanso: '60s' }
      ]
    },
    {
      title: 'Treino Full Body',
      description: 'Treino completo para todo o corpo',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      student: pedro,
      instructor: maria,
      exercises: [
        { nome: 'Agachamento', series: 4, repeticoes: '15', descanso: '90s' },
        { nome: 'Flexão', series: 3, repeticoes: '15', descanso: '60s' },
        { nome: 'Burpee', series: 3, repeticoes: '10', descanso: '60s' }
      ]
    }
  ];

  for (const treinoData of treinos) {
    if (!treinoData.student || !treinoData.instructor) {
      console.error('Aluno ou instrutor não encontrado para o treino:', treinoData.title);
      continue;
    }

    const treino = new WorkoutPlan();
    treino.title = treinoData.title;
    treino.description = treinoData.description;
    treino.status = treinoData.status as any;
    treino.startDate = treinoData.startDate;
    treino.endDate = treinoData.endDate;
    treino.student = treinoData.student;
    treino.studentId = treinoData.student.userId; // Usando userId do Student
    treino.instructor = treinoData.instructor;
    treino.instructorId = treinoData.instructor.userId; // Usando userId do Instructor
    treino.exercises = treinoData.exercises;

    await workoutPlanRepository.save(treino);
    console.log(`Treino "${treino.title}" criado com sucesso!`);
  }

  console.log('Seed de treinos concluído com sucesso!');
}

// Executa o seed se o arquivo for executado diretamente
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedWorkouts())
    .catch((error) => console.error('Erro ao executar o seed de treinos:', error))
    .finally(() => process.exit());
}
