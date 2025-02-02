import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

function History() {
    const [history, setHistory] = useState([]); 
    const [selectedItems, setSelectedItems] = useState([]); 
    const [newTemp, setNewTemp] = useState(""); 
    const [editMode, setEditMode] = useState(false); 

    
    useEffect(() => {
        const fetchHistory = async () => {
            const querySnapshot = await getDocs(collection(db, "weather_history"));
            setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchHistory();
    }, []);

    
    const handleSelect = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id) 
                : [...prevSelected, id] 
        );
    };

    
    const deleteSelected = async () => {
        for (const id of selectedItems) {
            await deleteDoc(doc(db, "weather_history", id));
        }
        setHistory(history.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]); 
    };

   
    const updateSelected = async () => {
        for (const id of selectedItems) {
            const docRef = doc(db, "weather_history", id);
            await updateDoc(docRef, { temp: parseFloat(newTemp) });
        }
        setHistory(history.map(item =>
            selectedItems.includes(item.id) ? { ...item, temp: newTemp } : item
        ));
        setEditMode(false);
        setSelectedItems([]); 
        setNewTemp(""); 
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">📜 History</h2>

            {history.length === 0 ? (
                <p> No research recorded.</p>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="border-t mt-2 pt-2 flex items-center w-96 gap-2">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelect(item.id)}
                            className="w-5 h-5"
                        />
                        <p className="flex-1">📍 {item.city} ({item.country}) - {item.temp}°C</p>
                    </div>
                ))
            )}

            {/* Boutons d'action */}
            {selectedItems.length > 0 && (
                <div className="mt-4 flex gap-4">
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={deleteSelected}
                    >
                        ❌ Delete 
                    </button>

                    <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                        onClick={() => setEditMode(true)}
                    >
                        ✏️ Edit 
                    </button>
                </div>
            )}

            {editMode && (
                <div className="mt-4 flex gap-2">
                    <input
                        type="number"
                        placeholder="New temperature"
                        className="p-1 border rounded"
                        value={newTemp}
                        onChange={(e) => setNewTemp(e.target.value)}
                    />
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={updateSelected}
                    >
                        ✅ Appliquer
                    </button>
                </div>
            )}
        </div>
    );
}

export default History;
