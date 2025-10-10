import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

const VersionManager: React.FC = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'mapVersions'));
    setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchVersions(); }, []);

  const backupNow = async () => {
    // Placeholder: Replace with real map data
    await addDoc(collection(db, 'mapVersions'), { date: new Date().toISOString(), data: { nodes: [], edges: [] } });
    fetchVersions();
  };

  const restoreVersion = async (id: string) => {
    const snap = await getDoc(doc(db, 'mapVersions', id));
    alert('Restoring version: ' + JSON.stringify(snap.data()));
    // TODO: Actually restore map data
  };

  return (
    <div>
      <button className="admin-btn mb-2" onClick={backupNow}>Backup Now</button>
      {loading ? <div>Loading...</div> : (
        <table className="w-full text-sm">
          <thead><tr><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {versions.map(v => (
              <tr key={v.id}>
                <td>{v.date}</td>
                <td><button className="admin-btn" onClick={() => restoreVersion(v.id)}>Restore</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VersionManager;
