import { Department } from '@/types';
import { generateId } from '@/utils/format';

export const departments: Department[] = [
  { id: 'dept_001', name: '行政部', manager: '张明' },
  { id: 'dept_002', name: '财务部', manager: '李华' },
  { id: 'dept_003', name: '技术部', manager: '王强' },
  { id: 'dept_004', name: '市场部', manager: '赵磊' },
  { id: 'dept_005', name: '人力资源部', manager: '陈静' },
  { id: 'dept_006', name: '运营部', manager: '刘洋' },
  { id: 'dept_007', name: '产品部', manager: '孙丽' },
  { id: 'dept_008', name: '客服部', manager: '周杰' },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}

export function getDepartmentName(id: string): string {
  return getDepartmentById(id)?.name || '未知部门';
}
