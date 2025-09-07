import React, { useState, useEffect } from 'react';
import { useWarehouseManagers, useWarehouseManagerOperations } from '../../hooks/useWarehouseHooks';
import type { WarehouseManager } from '../../data/warehouseData';

interface WarehouseManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: string;
  warehouseName: string;
}

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
  </svg>
);

export const WarehouseManagerModal: React.FC<WarehouseManagerModalProps> = ({
  open,
  onOpenChange,
  warehouseId,
  warehouseName,
}) => {
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  const { data: managers = [], mutate: mutateManagers } = useWarehouseManagers(warehouseId);
  const { isLoading, assignManagers, unassignManager } = useWarehouseManagerOperations();

  // Mock available users - in real app, this would come from an API
  useEffect(() => {
    setAvailableUsers([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    ]);
  }, []);

  const handleAssignManager = async (userId: string) => {
    try {
      await assignManagers(warehouseId, [userId]);
      await mutateManagers();
      setNewManagerEmail('');
    } catch (error) {
      console.error('Failed to assign manager:', error);
    }
  };

  const handleUnassignManager = async (managerId: string) => {
    try {
      await unassignManager(managerId);
      await mutateManagers();
    } catch (error) {
      console.error('Failed to unassign manager:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-textBlack">Warehouse Managers</h2>
            <p className="text-textDarkGrey text-sm">{warehouseName}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-textDarkGrey hover:text-textBlack"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Current Managers */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-textBlack mb-3">Current Managers</h3>
          {managers.length === 0 ? (
            <div className="text-center py-8 text-textDarkGrey">
              <UserIcon />
              <p className="mt-2">No managers assigned to this warehouse</p>
            </div>
          ) : (
            <div className="space-y-3">
              {managers.map((manager: WarehouseManager) => (
                <div
                  key={manager.id}
                  className="flex items-center justify-between p-3 border border-strokeGreyThree rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <div>
                      <p className="font-medium text-textBlack">
                        {manager.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-textDarkGrey">
                        {manager.user?.email || 'No email'}
                      </p>
                      <p className="text-xs text-textDarkGrey">
                        Assigned: {formatDate(manager.assignedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignManager(manager.id)}
                    disabled={isLoading}
                    className="text-errorTwo hover:text-errorTwo/80 p-2 rounded-full hover:bg-errorTwo/10 transition-colors disabled:opacity-50"
                    title="Remove manager"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Manager */}
        <div>
          <h3 className="text-lg font-medium text-textBlack mb-3">Add New Manager</h3>
          <div className="space-y-3">
            {availableUsers
              .filter(user => !managers.some((m: WarehouseManager) => m.user?.id === user.id))
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border border-strokeGreyThree rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-strokeGreyThree rounded-full flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <div>
                      <p className="font-medium text-textBlack">{user.name}</p>
                      <p className="text-sm text-textDarkGrey">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignManager(user.id)}
                    disabled={isLoading}
                    className="bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <PlusIcon />
                    Assign
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-strokeGreyThree">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-strokeGreyThree text-textBlack rounded-full hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};