
import { TaskType, LessonTask } from '../types';

export const LESSON_DATA: Record<string, LessonTask[]> = {
  'a1-1': [
    {
      id: 't1',
      type: TaskType.WRITING,
      question: "How do you say 'hello' formally at 8:00 AM?",
      targetText: "Good morning",
      xpReward: 10,
      skillImpact: 'writing'
    },
    {
      id: 't2',
      type: TaskType.SPEAKING,
      question: "Repeat clearly: 'Hi, my name is Alex. Nice to meet you.'",
      targetText: "Hi, my name is Alex. Nice to meet you.",
      xpReward: 20,
      skillImpact: 'speaking'
    },
    {
      id: 't3',
      type: TaskType.READING,
      question: "Which of these is the most appropriate response to 'How are you?'",
      options: ["I am 20 years old.", "I'm fine, thanks. And you?", "My name is John.", "I'm from London."],
      targetText: "I'm fine, thanks. And you?",
      xpReward: 10,
      skillImpact: 'reading'
    },
    {
      id: 't4',
      type: TaskType.LISTENING,
      question: "Listen and write the name you hear spelled.",
      audioText: "My name is Maria. M-A-R-I-A.",
      targetText: "Maria",
      xpReward: 15,
      skillImpact: 'listening'
    },
    {
      id: 't5',
      type: TaskType.WRITING,
      question: "Complete the sentence: 'Nice to ____ you.'",
      targetText: "meet",
      xpReward: 10,
      skillImpact: 'writing'
    },
    {
      id: 't6',
      type: TaskType.SPEAKING,
      question: "Say where you are from: 'I am from Brazil and I live in São Paulo.'",
      targetText: "I am from Brazil and I live in São Paulo.",
      xpReward: 20,
      skillImpact: 'speaking'
    },
    {
      id: 't7',
      type: TaskType.READING,
      question: "Choose the formal greeting used for a business meeting in the afternoon (3:00 PM).",
      options: ["What's up?", "Hey!", "Good afternoon", "Hi there"],
      targetText: "Good afternoon",
      xpReward: 10,
      skillImpact: 'reading'
    },
    {
      id: 't8',
      type: TaskType.LISTENING,
      question: "Write the number you hear mentioned in the audio.",
      audioText: "I have twenty-five students in my English class.",
      targetText: "25",
      xpReward: 15,
      skillImpact: 'listening'
    },
    {
      id: 't9',
      type: TaskType.WRITING,
      question: "Translate to English: 'Como você está?'",
      targetText: "How are you?",
      xpReward: 15,
      skillImpact: 'writing'
    },
    {
      id: 't10',
      type: TaskType.SPEAKING,
      question: "Say goodbye politely: 'See you later! Have a nice day.'",
      targetText: "See you later! Have a nice day.",
      xpReward: 20,
      skillImpact: 'speaking'
    },
    {
      id: 't11',
      type: TaskType.READING,
      question: "Put the conversation in order: (1) Nice to meet you too. (2) Hello, I'm Sarah. (3) Hi Sarah, I'm Paul. Nice to meet you.",
      options: ["1-2-3", "2-3-1", "3-2-1", "2-1-3"],
      targetText: "2-3-1",
      xpReward: 15,
      skillImpact: 'reading'
    },
    {
      id: 't12',
      type: TaskType.WRITING,
      question: "Fill in the blank: 'I ___ a student at Fluent Academy.'",
      targetText: "am",
      xpReward: 10,
      skillImpact: 'writing'
    },
    {
      id: 't13',
      type: TaskType.SPEAKING,
      question: "Practice emphasis: 'I am VERY happy to be here today!'",
      targetText: "I am VERY happy to be here today!",
      xpReward: 25,
      skillImpact: 'speaking'
    },
    {
      id: 't14',
      type: TaskType.LISTENING,
      question: "Listen and write the city name.",
      audioText: "I want to visit New York City next summer.",
      targetText: "New York",
      xpReward: 15,
      skillImpact: 'listening'
    },
    {
      id: 't15',
      type: TaskType.WRITING,
      question: "Introduce your friend Sarah to your teacher: 'Teacher, this is...'",
      targetText: "my friend Sarah",
      xpReward: 20,
      skillImpact: 'writing'
    }
  ]
};
