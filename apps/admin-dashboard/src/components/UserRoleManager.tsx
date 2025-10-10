import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

const roles = ['admin', 'editor', 'viewer'];

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'users'), { email, role });
    setEmail('');
    setRole('viewer');
    fetchUsers();
  };

  const updateRole = async (id: string, newRole: string) => {
    await updateDoc(doc(db, 'users', id), { role: newRole });
    fetchUsers();
  };

  return (
    <div>
      <form onSubmit={addUser} className="flex gap-2 mb-4">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="User email" className="border px-2 py-1 rounded" required />
        <select value={role} onChange={e => setRole(e.target.value)} className="border px-2 py-1 rounded">
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
        <button type="submit" className="admin-btn">Add User</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <table className="w-full text-sm">
          <thead><tr><th>Email</th><th>Role</th><th>Change</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="border px-1 py-0.5 rounded">
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserRoleManager;
