import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

const CardsPage: React.FC = () => {
  const [cards] = useState([
    // Ejemplo de tarjetas - inicialmente vacío como en la imagen
  ]);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
            <PlusIcon className="w-6 h-6 text-gray-600 ml-2" />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            + Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-sm font-medium text-gray-700">Default</div>
            <div className="text-sm font-medium text-gray-700">Card Number</div>
            <div className="text-sm font-medium text-gray-700">Action</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="px-6 py-8">
          {cards.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No cards found</p>
            </div>
          ) : (
            cards.map((card, index) => (
              <div key={index} className="grid grid-cols-3 gap-6 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    {(card as any).isDefault ? "Yes" : "No"}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  {(card as any).type} •••• {(card as any).last4}
                </div>
                <div className="text-sm">
                  <button className="text-red-600 hover:text-red-700">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-700">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
        
        <div className="flex items-center text-sm text-gray-700">
          <span>{cards.length === 0 ? "0-0" : `1-${Math.min(rowsPerPage, cards.length)}`} of {cards.length}</span>
          <div className="ml-4 flex space-x-2">
            <button
              disabled={cards.length === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button
              disabled={cards.length === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsPage;

