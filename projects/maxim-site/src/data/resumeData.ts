import type { ResumeData } from '../types/resume';

export const resumeData: ResumeData = {
  name: 'Громилов Максим',
  role: 'Full-stack разработчик / Системный архитектор',
  location: 'Казань / Удаленно',
  about: 'Опыт проектирования и разработки сложных веб-интерфейсов и систем. 9 лет практического опыта.',
  experience: [
    {
      id: 'ecosystems',
      title: 'Разработка экосистемных решений',
      period: '2024 — н.в.',
      description: 'Системы управления и дашборды',
      achievements: [
        'Проектирование и реализация распределенных систем управления',
        'Создание высокопроизводительных панелей мониторинга'
      ],
      tags: ['Astro', 'Vue 3', 'TypeScript', 'Drizzle']
    }
  ],
  skillCategories: [
    {
      title: 'Интерфейсная разработка',
      skills: ['TypeScript', 'Vue 3', 'Vite', 'Astro'],
      color: 'magenta'
    }
  ],
  rnd: [
    {
      title: 'Разработка на базе ИИ',
      description: 'Исследование методов сборки веб-приложений с использованием LLM.',
      status: 'Active Research'
    }
  ],
  contact: {
    message: 'Готов обсудить ваши задачи по архитектуре систем, разработке сложных интерфейсов или автоматизации процессов с применением ИИ.',
    telegram: 'gromilov'
  }
};
