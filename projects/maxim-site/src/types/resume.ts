/**
 * Статус исследовательского проекта
 */
export type ProjectStatus = 'Active Research' | 'Completed' | 'Concept';

/**
 * Описание одной позиции в опыте работы
 */
export interface ExperienceItem {
  id: string;
  title: string;
  company?: string;
  period: string;
  description: string;
  achievements: string[];
  tags: string[];
}

/**
 * Тип для обновления опыта (все поля необязательны)
 * Это полезно, когда мы хотим изменить только одно поле, например только title.
 */
export type UpdateExperienceDto = Partial<ExperienceItem>;
export interface SkillCategory {
  title: string;
  skills: string[];
  color: 'magenta' | 'cyan' | 'yellow' | 'green';
}

/**
 * Основная структура данных резюме
 */
export interface ResumeData {
  name: string;
  role: string;
  location: string;
  about: string;
  experience: ExperienceItem[];
  skillCategories: SkillCategory[];
  rnd: {
    title: string;
    description: string;
    status: ProjectStatus;
  }[];
  contact: {
    message: string;
    telegram: string;
  };
}
