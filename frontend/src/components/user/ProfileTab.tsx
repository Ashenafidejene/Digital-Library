import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfileTab: React.FC = () => {
  const { user } = useAuth();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Profile
      </h3>
      {user ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</label>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{user.role}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">No user data</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Could not load user profile information.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileTab;
