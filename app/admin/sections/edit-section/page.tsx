'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const EditSubject = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section_id = searchParams.get('section_id');

  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (section_id) {
      const fetchSubject = async () => {
        try {
          const response = await fetch('/api/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'get-section-by-id', section_id: section_id })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.length > 0) {
            const section = data[0];
            setSectionName(section.section_name);
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
      setError('Section ID is missing');
      setLoading(false);
    }
  }, [section_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update-section', section_id: section_id, section_name: sectionName}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('Section updated successfully!');
      router.push('/admin/sections');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading section...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Edit Section</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="section_name">Section Name:</label>
          <input
            type="text"
            id="section_name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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