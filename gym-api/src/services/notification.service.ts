import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';
import { Student } from '../entities/Student';

class NotificationService {
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = 'system',
    relatedId?: number
  ) {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const userRepository = AppDataSource.getRepository(User);
      
      // Verifica se o usuário existe
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const notification = notificationRepository.create({
        title,
        message,
        type,
        relatedId,
        userId: userId.toString(),
        read: false,
      });
      
      await notificationRepository.save(notification);
      console.log('Nova notificação criada:', notification);
      
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async getNotifications(userId: number) {
    const notificationRepository = AppDataSource.getRepository(Notification);
    return await notificationRepository.find({
      where: { userId: userId.toString() },
      order: { createdAt: 'DESC' },
      take: 50 // Limita a 50 notificações mais recentes
    });
  }
  
  async markAsRead(notificationId: number) {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({ 
      where: { id: notificationId } 
    });
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }
    
    notification.read = true;
    return await notificationRepository.save(notification);
  }
  
  async markAllAsRead(userId: number) {
    const notificationRepository = AppDataSource.getRepository(Notification);
    await notificationRepository.update(
      { userId: userId.toString(), read: false },
      { read: true }
    );
    
    return { success: true };
  }

  async notifyNewPayment(studentId: number, paymentId: number, amount: number, dueDate: Date) {
    try {
      const studentRepository = AppDataSource.getRepository(Student);
      
      // Buscar o estudante e seu usuário associado
      const student = await studentRepository.findOne({
        where: { id: studentId } as any, // Usando 'as any' temporariamente
        relations: ['user']
      });

      if (!student?.user) {
        throw new Error('Aluno não encontrado');
      }

      const title = 'Nova cobrança gerada';
      const message = `Foi gerada uma nova cobrança no valor de R$ ${amount.toFixed(2)} com vencimento em ${new Date(dueDate).toLocaleDateString('pt-BR')}.`;

      return await this.createNotification(
        student.user.id,
        title,
        message,
        'payment',
        paymentId
      );

      // Aqui você pode adicionar lógica para enviar email/SMS se necessário
      // Por exemplo:
      // await this.sendEmailNotification(student.user.email, notification);
      // await this.sendSMSNotification(student.phone, notification.message);

    } catch (error) {
      console.error('Erro ao notificar sobre novo pagamento:', error);
      // Não queremos que um erro na notificação interrompa o fluxo principal
      return null;
    }
  }

  // Métodos para envio de email/SMS podem ser adicionados aqui
  /*
  private async sendEmailNotification(email: string, notification: NotificationData) {
    // Implementação do envio de email
  }

  private async sendSMSNotification(phone: string, message: string) {
    // Implementação do envio de SMS
  }
  */
}

export const notificationService = new NotificationService();
