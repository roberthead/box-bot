import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function MessageHistory() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    fetch('http://localhost:3000/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleResend = async (msg) => {
    setResending({ ...resending, [msg.id]: true });
    try {
      await fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: msg.from_email,
          sent_at: msg.sent_at,
          subject: msg.subject,
          body: msg.body
        })
      });
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setResending({ ...resending, [msg.id]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Message History</h1>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Message
          </a>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No messages yet
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Message</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">From: </span>
                        <span className="text-gray-600">{msg.from_email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Sent: </span>
                        <span className="text-gray-600">{msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Subject: </span>
                        <span className="text-gray-600">{msg.subject || 'N/A'}</span>
                      </div>
                      <div className="mt-4">
                        <span className="font-medium text-gray-700">Body:</span>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{msg.body || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Assistant Response ({msg.agent_name})
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Request:</span>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                          {msg.request}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Response:</span>
                        <p className="text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                          {msg.response}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleResend(msg)}
                    disabled={resending[msg.id]}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {resending[msg.id] ? 'Sending...' : 'Send Again'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MessageHistory />);