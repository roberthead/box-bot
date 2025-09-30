import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function MessageForm() {
  const [formData, setFormData] = useState({
    from: '',
    sent_at: '',
    subject: '',
    body: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResponse(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Assistant</h1>
          <a
            href="/messages.html"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            View History
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Compose Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sent At</label>
                <input
                  name="sent_at"
                  value={formData.sent_at}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending to Assistant…' : 'Send to Assistant'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Assistant Response</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Processing message...</p>
                </div>
              </div>
            ) : response ? (
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {response.response}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Submit a message to see the assistant's response</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MessageForm />);