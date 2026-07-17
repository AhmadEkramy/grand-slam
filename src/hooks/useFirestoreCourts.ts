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
    customTitle?: {
        en?: string;
        ar?: string;
    };
}

export interface LocationConfig {
    id: string; // "saha" | "doray_bay"
    title: {
        en: string;
        ar: string;
    };
    image: string;
    description: {
        en: string;
        ar: string;
    };
}

export function useFirestoreCourts() {
    // Default to all 4 courts visible if nothing in Firestore yet
    const [courts, setCourts] = useState<CourtConfig[]>([
        { id: 1, isVisible: true },
        { id: 2, isVisible: true },
        { id: 3, isVisible: true },
        { id: 4, isVisible: true }
    ]);
    const [locations, setLocations] = useState<LocationConfig[]>([
        {
            id: "saha",
            title: { en: "Saha Courts", ar: "ملاعب الساحة" },
            image: "/saha_court.png",
            description: {
                en: "Modern indoor facilities with world-class padel courts and optimal lighting.",
                ar: "مرافق داخلية حديثة مع ملاعب بادل ذات مستوى عالمي وإضاءة مثالية."
            }
        },
        {
            id: "doray_bay",
            title: { en: "Doray Bay Ras Elbar", ar: "دوراى باى راس البر" },
            image: "/doray_bay_court.png",
            description: {
                en: "Premium seaside courts in Doray Bay with fresh sea breeze and breathtaking sunsets.",
                ar: "ملاعب مميزة على البحر في دوراي باي مع نسيم البحر المنعش وغروب الشمس الخلاب."
            }
        }
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
                            isVisible: d.isVisible ?? true,
                            customTitle: d.customTitle || {}
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

    // Real-time listener on "locations" collection
    useEffect(() => {
        const q = query(collection(db, "locations"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const data: any[] = snapshot.docs.map((docSnap) => {
                        const d = docSnap.data();
                        return {
                            id: docSnap.id,
                            title: d.title || {},
                            image: d.image || "",
                            description: d.description || {}
                        };
                    });

                    // Merge with defaults
                    const defaultLocations = [
                        {
                            id: "saha",
                            title: { en: "Saha Courts", ar: "ملاعب الساحة" },
                            image: "/saha_court.png",
                            description: {
                                en: "Modern indoor facilities with world-class padel courts and optimal lighting.",
                                ar: "مرافق داخلية حديثة مع ملاعب بادل ذات مستوى عالمي وإضاءة مثالية."
                            }
                        },
                        {
                            id: "doray_bay",
                            title: { en: "Doray Bay Ras Elbar", ar: "دوراى باى راس البر" },
                            image: "/doray_bay_court.png",
                            description: {
                                en: "Premium seaside courts in Doray Bay with fresh sea breeze and breathtaking sunsets.",
                                ar: "ملاعب مميزة على البحر في دوراي باي مع نسيم البحر المنعش وغروب الشمس الخلاب."
                            }
                        }
                    ];

                    const merged = defaultLocations.map(defLoc => {
                        const existing = data.find(l => l.id === defLoc.id);
                        return existing ? {
                            id: defLoc.id,
                            title: {
                                en: existing.title?.en || defLoc.title.en,
                                ar: existing.title?.ar || defLoc.title.ar
                            },
                            image: existing.image || defLoc.image,
                            description: {
                                en: existing.description?.en || defLoc.description.en,
                                ar: existing.description?.ar || defLoc.description.ar
                            }
                        } : defLoc;
                    });
                    setLocations(merged);
                }
            },
            (err) => {
                console.error("Firestore locations listener error:", err);
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

    // Update court title in Firestore
    async function updateCourtTitle(id: number, customTitle: { en?: string; ar?: string }) {
        await setDoc(doc(db, "courts", id.toString()), {
            id,
            customTitle
        }, { merge: true });
    }

    // Update location details in Firestore
    async function updateLocation(id: string, updates: Partial<LocationConfig>) {
        await setDoc(doc(db, "locations", id), updates, { merge: true });
    }

    return {
        courts,
        locations,
        loading,
        error,
        updateCourtVisibility,
        updateCourtTitle,
        updateLocation,
    };
}
