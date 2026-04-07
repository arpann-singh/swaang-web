"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileEditor() {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        // Find the team document matching this user's email
        const q = query(collection(db, "team"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docRef = doc(db, "team", querySnapshot.docs[0].id);
          onSnapshot(docRef, (snap) => {
            setMemberData({ id: snap.id, ...snap.data() });
            setLoading(false);
          });
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberData) return;
    
    const docRef = doc(db, "team", memberData.id);
    await updateDoc(docRef, {
      description: memberData.description,
      instagram: memberData.instagram,
      linkedin: memberData.linkedin,
      github: memberData.github
    });
    alert("Profile Updated! Changes are live on the Ensemble.");
  };

  if (loading) return <p className="animate-pulse font-black uppercase">Loading your locker...</p>;

  return (
    <form onSubmit={handleUpdate} className="bg-white border-4 border-black p-8 rounded-[2rem] shadow-[8px_8px_0px_black] text-black">
      <h3 className="font-black uppercase text-xl mb-4 italic">Edit My Bio</h3>
      <textarea 
        value={memberData.description} 
        onChange={e => setMemberData({...memberData, description: e.target.value})}
        className="w-full border-2 border-black rounded-xl p-4 font-bold h-32 mb-4"
        placeholder="Tell your story..."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input 
          placeholder="Instagram handle" 
          value={memberData.instagram} 
          onChange={e => setMemberData({...memberData, instagram: e.target.value})}
          className="border-2 border-black p-3 rounded-xl font-bold text-xs"
        />
        {/* Add LinkedIn and GitHub inputs similarly */}
      </div>
      <button type="submit" className="w-full bg-[#FF5F5F] text-white py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_black]">
        Sync My Profile
      </button>
    </form>
  );
}