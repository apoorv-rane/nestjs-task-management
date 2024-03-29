import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = this.createQueryBuilder('task');
    query.where({ user });
    if (filterDto.status) {
      query.andWhere('task.status = :status', { status: filterDto.status });
    }
    if (filterDto.search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${filterDto.search}%` },
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
      user,
    });
    return await this.save(task);
  }
}
