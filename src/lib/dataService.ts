import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export const getTimeline = async () => {
  try {
    const q = query(collection(db, "timeline"), orderBy("year", "asc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data.length > 0 ? data : null;
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return null;
  }
};

export const getTeam = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "team"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data.length > 0 ? data : null;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
};
