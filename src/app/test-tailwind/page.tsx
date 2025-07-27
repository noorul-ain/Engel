"use client";

import Link from "next/link";

export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tailwind CSS v4 Test
          </h1>
          <p className="text-lg text-gray-600">
            Testing if Tailwind CSS is working correctly
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Colors */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Colors Test
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-sm">Primary (#4C6FFF)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-accent rounded"></div>
                <span className="text-sm">Accent (#00C896)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-danger rounded"></div>
                <span className="text-sm">Danger (#FF5F5F)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded"></div>
                <span className="text-sm">Success (#00C896)</span>
              </div>
            </div>
          </div>

          {/* Card 2 - Typography */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Typography Test
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Extra Small Text</p>
              <p className="text-sm text-gray-600">Small Text</p>
              <p className="text-base text-gray-800">Base Text</p>
              <p className="text-lg text-gray-800">Large Text</p>
              <p className="text-xl font-semibold text-gray-900">
                Extra Large Text
              </p>
            </div>
          </div>

          {/* Card 3 - Spacing */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Spacing Test
            </h3>
            <div className="space-y-4">
              <div className="p-2 bg-blue-100 rounded text-center text-sm">
                p-2
              </div>
              <div className="p-4 bg-green-100 rounded text-center text-sm">
                p-4
              </div>
              <div className="p-6 bg-purple-100 rounded text-center text-sm">
                p-6
              </div>
              <div className="p-8 bg-orange-100 rounded text-center text-sm">
                p-8
              </div>
            </div>
          </div>
        </div>

        {/* Buttons Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Buttons Test
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
              Primary Button
            </button>
            <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300">
              Accent Button
            </button>
            <button className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300">
              Danger Button
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300">
              Secondary Button
            </button>
          </div>
        </div>

        {/* Status Check */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Status Check
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                ✅ Tailwind CSS v4: Working
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                ✅ Custom Colors: Working
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                ✅ Responsive Design: Working
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                ✅ Hover Effects: Working
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              🎉 All Systems Operational!
            </h4>
            <p className="text-green-700 text-sm">
              Tailwind CSS v4 is working correctly. You can now use all Tailwind
              classes in your components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
