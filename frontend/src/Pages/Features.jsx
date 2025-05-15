import React from 'react';

function Features() {
  const features = [
    { emoji: '🗓️', title: 'Calendar-based Access', desc: 'Easily browse entries by date using an intuitive calendar view.' },
    { emoji: '🔐', title: 'AES-256 Encryption', desc: 'Military-grade security to protect your sensitive diary content.' },
    { emoji: '🧽', title: 'Entry Deletion', desc: 'Quickly remove unwanted entries with ease and safety.' },
    { emoji: '📁', title: 'Organize by Month/Year', desc: 'Group entries by time periods for better structure.' },
    { emoji: '📦', title: 'Optimized Media Storage', desc: 'Efficient storage with Cloudinary or S3 support.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 py-16 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10">✨ Upcoming Features</h1>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
          {features.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-blue-200"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{item.emoji}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;
