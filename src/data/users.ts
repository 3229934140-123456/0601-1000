import { User } from '@/types';
import { departments } from './departments';

export const users: User[] = [
  { id: 'user_001', name: '张明', departmentId: 'dept_001', role: 'admin', email: 'zhangming@company.com' },
  { id: 'user_002', name: '李华', departmentId: 'dept_002', role: 'finance', email: 'lihua@company.com' },
  { id: 'user_003', name: '王强', departmentId: 'dept_003', role: 'admin', email: 'wangqiang@company.com' },
  { id: 'user_004', name: '赵磊', departmentId: 'dept_004', role: 'user', email: 'zhaolei@company.com' },
  { id: 'user_005', name: '陈静', departmentId: 'dept_005', role: 'user', email: 'chenjing@company.com' },
  { id: 'user_006', name: '刘洋', departmentId: 'dept_006', role: 'user', email: 'liuyang@company.com' },
  { id: 'user_007', name: '孙丽', departmentId: 'dept_007', role: 'user', email: 'sunli@company.com' },
  { id: 'user_008', name: '周杰', departmentId: 'dept_008', role: 'user', email: 'zhoujie@company.com' },
  { id: 'user_009', name: '吴敏', departmentId: 'dept_003', role: 'user', email: 'wumin@company.com' },
  { id: 'user_010', name: '郑浩', departmentId: 'dept_003', role: 'user', email: 'zhenghao@company.com' },
];

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getUserName(id: string): string {
  return getUserById(id)?.name || '未知用户';
}

export function getUsersByDepartment(departmentId: string): User[] {
  return users.filter((u) => u.departmentId === departmentId);
}

export function getDepartmentName(departmentId: string): string {
  return departments.find((d) => d.id === departmentId)?.name || '未知部门';
}
