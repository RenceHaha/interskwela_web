'use client'
import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

interface Users {
  user_id: number;
  email: string;
  role: string;
  firstname: string;
  middlename: string;
  lastname: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface Section {
  section_id: number;
  section_name: string;
}

interface FormData {
  subject_id: string;
  teacher_id: string;
  section_id: string;
  class_code: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  students: number[];
}

export default function ClassesPage() {
  const [formData, setFormData] = useState<FormData>({
    subject_id: '',
    teacher_id: '',
    section_id: '',
    class_code: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    students: []
  })

  const [teachers, setTeachers] = useState<Users[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [students, setStudents] = useState<Users[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersRes = await fetch('/api/accounts',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 'get-teachers'})
        })
        const teachersData = await teachersRes.json()
        setTeachers(teachersData)

        const studentsRes = await fetch('/api/accounts',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 'get-students'})
        })
        const studentsData = await studentsRes.json()
        setStudents(studentsData)

        const subjectsRes = await fetch('/api/subjects')
        const subjectData = await subjectsRes.json()
        setSubjects(subjectData)

        const sectionsRes = await fetch('/api/sections')
        const sectionsData = await sectionsRes.json()
        setSections(sectionsData)


        // Fetch other data similarly
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-class',
          ...formData,
          students: selectedStudents
        })
      })
      if (response.ok) {
        alert('Class created successfully')
      }
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    setSelectedStudents(prev => 
      checked 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Class</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.user_id} value={teacher.user_id}>
                  {teacher.firstname + ' ' + teacher.lastname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, section_id: e.target.value})}
              required
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section.section_id} value={section.section_id}>
                  {section.section_name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Class Code"
            className="p-2 border rounded"
            onChange={(e) => setFormData({...formData, class_code: e.target.value})}
            required
          />

          <input
            type="date"
            className="p-2 border rounded"
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            required
          />

          <input
            type="date"
            className="p-2 border rounded"
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            required
          />

          <input
            type="time"
            className="p-2 border rounded"
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            required
          />

          <input
            type="time"
            className="p-2 border rounded"
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
            required
          />
        </div>

        <textarea
          placeholder="Class Description"
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />

        <div>
          <h2 className="text-lg font-semibold mb-2">Select Students</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Select</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.user_id}>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      onChange={(e) => handleStudentSelection(student.user_id, e.target.checked)}
                    />
                  </td>
                  <td className="border p-2">{student.firstname + ' ' + student.lastname}</td>
                  <td className="border p-2">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Class
        </button>
      </form>
    </div>
  )
}
