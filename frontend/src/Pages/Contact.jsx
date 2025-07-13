import React from 'react';

// Example skull background (you can replace the URL with a local or better one)
const skullBackground = 'https://www.transparenttextures.com/patterns/skulls.png';

function Contact({ currentTheme }) {
  const text = currentTheme?.text || 'text-white';

  return (
    <div
      className={`min-h-screen bg-cover bg-center px-6 py-24 flex justify-center items-center`}
      style={{
        backgroundImage: `url(${skullBackground})`,
        backgroundColor: '#111827', // fallback dark color
      }}
    >
      <div className="max-w-md bg-white bg-opacity-90 rounded-lg shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Author</h1>
        <p className="text-lg font-semibold text-gray-800 mb-1">Bala Giri (aka Novachrono)</p>
        <p className="text-md text-gray-700 mb-6">Capstone Project | Kalvium S82</p>
        <p className="text-md text-gray-700">
          <span className="font-semibold">Contact :</span> balagiri702@gmail.com
        </p>
      </div>
    </div>
  );
}

export default Contact;
