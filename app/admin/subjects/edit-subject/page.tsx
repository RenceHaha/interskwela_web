'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const EditSubject = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject_id = searchParams.get('subject_id');

  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subject_id) {
      const fetchSubject = async () => {
        try {
          const response = await fetch('/api/subjects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'get-subject-by-id', subject_id: subject_id })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.length > 0) {
            const subject = data[0];
            setSubjectName(subject.subject_name);
            setSubjectCode(subject.subject_code || '');
            setDescription(subject.description);
          } else {
            setError('Subject not found');
          }
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchSubject();
    } else {
      setError('Subject ID is missing');
      setLoading(false);
    }
  }, [subject_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update-subject', subject_id: subject_id, subject_name: subjectName, subject_code: subjectCode, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('Subject updated successfully!');
      router.push('/admin/subjects');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading subject...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Edit Subject</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject_name">Subject Name:</label>
          <input
            type="text"
            id="subject_name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="subject_code">Subject Code:</label>
          <input
            type="text"
            id="subject_code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Subject'}
        </button>
      </form>
    </div>
  );
};

export default EditSubject;