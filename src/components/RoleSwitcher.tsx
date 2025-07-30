import React from 'react';

const ROLES = ['viewer', 'editor', 'uploader', 'curator', 'configurator', 'admin'] as const;

export const RoleSwitcher: React.FC = () => {
  const current = localStorage.getItem('mcpRole') || 'viewer';

  const updateRole = (role: string) => {
    localStorage.setItem('mcpRole', role);
    window.location.reload();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🔁 Role:</label>
      <select
        className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        value={current}
        onChange={(e) => updateRole(e.target.value)}
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}; 