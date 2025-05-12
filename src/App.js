import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="bg-indigo-500 text-white p-4 rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold mb-2">TailwindCSS Test</h1>
                  <p>If you can see this styled div with a blue background, white text, and rounded corners, TailwindCSS is working correctly!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 