import { useState, useEffect } from "react";
import {
    collection,
    query,
    onSnapshot,
    setDoc,
    doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CourtConfig {
    id: number;
    isVisible: boolean;
}

export function useFirestoreCourts() {
    // Default to all 4 courts visible if nothing in Firestore yet
    const [courts, setCourts] = useState<CourtConfig[]>([
        { id: 1, isVisible: true },
        { id: 2, isVisible: true },
        { id: 3, isVisible: true },
        { id: 4, isVisible: true }
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Real-time listener on "courts" collection
    useEffect(() => {
        const q = query(collection(db, "courts"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const data: CourtConfig[] = snapshot.docs.map((docSnap) => {
                        const d = docSnap.data();
                        return {
                            id: Number(docSnap.id) || d.id,
                            isVisible: d.isVisible ?? true
                        };
                    });
                    
                    // Merge with defaults to ensure all courts exist
                    const mergedCourts = [1, 2, 3, 4].map(id => {
                        const existing = data.find(c => c.id === id);
                        return existing || { id, isVisible: true };
                    });
                    setCourts(mergedCourts);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore courts listener error:", err);
                setError(err.message);
                setLoading(false);
            }
        );
        return unsubscribe;
    }, []);

    // Update court visibility in Firestore
    async function updateCourtVisibility(id: number, isVisible: boolean) {
        await setDoc(doc(db, "courts", id.toString()), {
            id,
            isVisible
        }, { merge: true });
    }

    return {
        courts,
        loading,
        error,
        updateCourtVisibility,
    };
}
