export const CHALLENGE_TYPES = {
  MCQ_QUIZ: {
    id: 'mcq_quiz',
    name: 'MCQ Quiz',
    icon: 'Brain',
    description: 'Multiple choice questions with timed or untimed quizzes',
    fields: ['title', 'description', 'timeLimit', 'passingScore', 'points', 'deadline', 'questions'],
    questionFields: ['question', 'choices', 'correctAnswer', 'explanation'],
  },
  IMAGE_UPLOAD: {
    id: 'image_upload',
    name: 'Image Upload Challenge',
    icon: 'Image',
    description: 'Submit images based on a specific theme or topic',
    fields: ['title', 'description', 'theme', 'timeLimit', 'points', 'deadline'],
  },
  VIDEO_UPLOAD: {
    id: 'video_upload',
    name: 'Video Upload Challenge',
    icon: 'Video',
    description: 'Submit videos demonstrating skills or creativity',
    fields: ['title', 'description', 'theme', 'timeLimit', 'points', 'deadline'],
  },
  TEXT_ESSAY: {
    id: 'text_essay',
    name: 'Text/Essay Submission',
    icon: 'FileText',
    description: 'Write essays or text responses on given topics',
    fields: ['title', 'description', 'topic', 'wordLimit', 'timeLimit', 'points', 'deadline'],
  },
  FILE_UPLOAD: {
    id: 'file_upload',
    name: 'File Upload Challenge',
    icon: 'Upload',
    description: 'Submit files (documents, code, projects, etc.)',
    fields: ['title', 'description', 'acceptedFormats', 'timeLimit', 'points', 'deadline'],
  },
  POLL_VOTING: {
    id: 'poll_voting',
    name: 'Poll/Voting Challenge',
    icon: 'BarChart',
    description: 'Community voting on predefined options',
    fields: ['title', 'description', 'options', 'allowMultiple', 'timeLimit', 'points', 'deadline'],
  },
};

export const CHALLENGE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
};

export const SUBMISSION_STATUS = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const CHALLENGE_CATEGORIES = [
  'General',
  'Science',
  'Technology',
  'Art',
  'Sports',
  'Gaming',
  'Education',
  'Creativity',
  'Skills',
  'Other',
];
