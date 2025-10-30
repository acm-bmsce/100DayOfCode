import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

export default function AddProblem() {
  const [questionName, setQuestionName] = useState('');
  const [points, setPoints] = useState(10);
  const [link, setLink] = useState('');
  const [day, setDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/add-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_name: questionName,
          points: parseInt(points, 10),
          link,
          day: parseInt(day, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add problem');
      
      setMessage({ type: 'success', text: data.message });
      // Clear the form on success
      setQuestionName('');
      setPoints(10);
      setLink('');
      setDay('');

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-red-500">ADD NEW PROBLEM</h3>
      
      <div>
        <label htmlFor="q-name" className="block text-red-400">&gt; Question Name:</label>
        <input 
          id="q-name" 
          type="text" 
          value={questionName} 
          onChange={(e) => setQuestionName(e.target.value)} 
          className="input-hacker border-red-700! !focus:ring-red-500 w-full" 
          required 
        />
      </div>

      <div>
        <label htmlFor="q-link" className="block text-red-400">&gt; LeetCode Link:</label>
        <input 
          id="q-link" 
          type="url" 
          value={link} 
          onChange={(e) => setLink(e.target.value)} 
          className="input-hacker border-red-700! !focus:ring-red-500 w-full" 
          placeholder="https://leetcode.com/problems/..."
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="q-day" className="block text-red-400">&gt; Day #:</label>
          <input 
            id="q-day" 
            type="number" 
            value={day} 
            onChange={(e) => setDay(e.target.value)} 
            className="input-hacker border-red-700! !focus:ring-red-500 w-full" 
            required 
          />
        </div>
        <div>
          <label htmlFor="q-points" className="block text-red-400">&gt; Points:</label>
          <input 
            id="q-points" 
            type="number" 
            value={points} 
            onChange={(e) => setPoints(e.target.value)} 
            className="input-hacker border-red-700! !focus:ring-red-500 w-full" 
            required 
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-hacker-admin disabled:opacity-50">
        {isLoading ? 'ADDING...' : 'ADD_TO_DATABASE'}
      </button>
      {message && (
        <p className={`mt-2 text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-400'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}