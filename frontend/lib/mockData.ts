export interface Student {
  id: string;
  name: string;
  usn: string;
  subject: string;
  status: 'Pending' | 'Completed' | '';
  avatarSeed: number;
}

export interface PastEvaluation {
  id: string;
  name: string;
  usn: string;
  subject: string;
  marks: string;
  date: string;
  avatarSeed: number;
}

export interface Subject {
  code: string;
  name: string;
}

export const subjects: Subject[] = [
  { code: 'CS301', name: 'Data Structures' },
  { code: 'CS302', name: 'Algorithms' },
  { code: 'CS303', name: 'Database Systems' },
];

export const studentEvaluations: Student[] = [
  { id: '1', name: 'XYZ', usn: '1MS21CS045', subject: 'Data Structures', status: 'Pending', avatarSeed: 1 },
  { id: '2', name: 'ABC', usn: '1MS21CS023', subject: 'Algorithms', status: '', avatarSeed: 2 },
  { id: '3', name: 'QWE', usn: '1MS21CS067', subject: 'Database Systems', status: 'Pending', avatarSeed: 3 },
  { id: '4', name: 'RTY', usn: '1MS21CS089', subject: 'Data Structures', status: '', avatarSeed: 4 },
  { id: '5', name: 'DFG', usn: '1MS21CS034', subject: 'Algorithms', status: 'Pending', avatarSeed: 5 },
];

export const pastEvaluations: PastEvaluation[] = [
  { id: '1', name: 'ABC', usn: '1MS21CS045', subject: 'Computer Science', marks: '85/100', date: 'Jan 28, 2025', avatarSeed: 1 },
  { id: '2', name: 'DEF', usn: '1MS21CS032', subject: 'Mathematics', marks: '92/100', date: 'Jan 27, 2025', avatarSeed: 2 },
  { id: '3', name: 'HGI', usn: '1MS21CS018', subject: 'Physics', marks: '78/100', date: 'Jan 26, 2025', avatarSeed: 3 },
  { id: '4', name: 'MNO', usn: '1MS21CS067', subject: 'Chemistry', marks: '88/100', date: 'Jan 25, 2025', avatarSeed: 4 },
  { id: '5', name: 'EDF', usn: '1MS21CS091', subject: 'English', marks: '95/100', date: 'Jan 24, 2025', avatarSeed: 5 },
  { id: '6', name: 'XYZ', usn: '1MS21CS053', subject: 'Computer Science', marks: '72/100', date: 'Jan 23, 2025', avatarSeed: 6 },
];

export interface StudentUpload {
  id: string;
  name: string;
  usn: string;
  uploadStatus: 'Uploaded' | 'Pending';
  uploadedFile?: string;
  avatarSeed: number;
}

export interface Faculty {
  name: string;
  email: string;
  department: string;
  designation: string;
}

export interface Course {
  id: string;
  name: string;
  faculty: Faculty;
  referenceUploaded: boolean;
  referenceFile?: string;
  students: StudentUpload[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  courses: Course[];
  total_students: number;
}

export type UploadType = 'Reference' | 'Student Answer';

export interface UploadRecord {
  id: string;
  department: string;
  course: string;
  type: UploadType;
  uploadedBy: string;
  date: string;
}

export const uploadRecords: UploadRecord[] = [
  { id: 'u1', department: 'Computer Science', course: 'Algorithms', type: 'Reference', uploadedBy: 'Dr. Neha R.', date: 'Mar 12, 2026' },
  { id: 'u2', department: 'Computer Science', course: 'Algorithms', type: 'Student Answer', uploadedBy: 'Aria Sharma', date: 'Mar 12, 2026' },
  { id: 'u3', department: 'Electrical Engineering', course: 'Power Systems', type: 'Reference', uploadedBy: 'Dr. Sanjay P.', date: 'Mar 10, 2026' },
  { id: 'u4', department: 'Electrical Engineering', course: 'Power Systems', type: 'Student Answer', uploadedBy: 'Tanya Joshi', date: 'Mar 10, 2026' },
  { id: 'u5', department: 'Mechanical Engineering', course: 'Thermodynamics', type: 'Student Answer', uploadedBy: 'Adi Kumar', date: 'Mar 8, 2026' },
  { id: 'u6', department: 'Computer Science', course: 'Database Systems', type: 'Student Answer', uploadedBy: 'Neil Varma', date: 'Mar 9, 2026' },
];

export const evaluationData = {
  studentName: 'ABC',
  usn: '1AUAxxBITxxx',
  subject: 'Data Structures & Algorithms',
  question: 'Explain the concept of Binary Search Tree and its properties.',
  maxMarks: 10,
  referenceAnswer: `A Binary Search Tree (BST) is a hierarchical data structure where each node has at most two children, referred to as the left child and right child.

**Key Properties:**
• The left subtree of a node contains only nodes with keys lesser than the node's key
• The right subtree of a node contains only nodes with keys greater than the node's key
• Both left and right subtrees must also be binary search trees
• No duplicate nodes are allowed in a standard BST

**Time Complexity:**
Average case O(log n) for search, insert, and delete operations. Worst case O(n) when tree becomes skewed.

Key Points to Cover`,
  studentAnswer: `Binary Search Tree is a tree data structure where each node can have maximum two children. It is called binary search tree because it maintains a sorted order.

In BST, all values in left subtree are smaller than root node and all values in right subtree are larger than root node. This property applies to every node in the tree.

**Properties:**
• Left child values are less than parent
• Right child values are greater than parent
• Each subtree is also a BST

BST operations like search, insert and delete take O(log n) time in balanced tree. It is used in database indexing and file systems.`,
  wordCount: 142,
  submitted: 'Jan 28, 2025 10:45 AM',
  similarityScore: 78,
  marksAwarded: 8,
  keyPointsCovered: '3/4',
  technicalAccuracy: 'High',
  clarity: 'Good',
  feedback: 'Good understanding of BST concepts. Covered most key properties. Missing detailed explanation of worst-case time complexity scenario.',
};
