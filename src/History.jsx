import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";

function History() {
    const [history, setHistory] = useState([]); 
    const [selectedItems, setSelectedItems] = useState([]); 
    const [newTemp, setNewTemp] = useState(""); 
    const [editMode, setEditMode] = useState(false); 
    const [exportFormat, setExportFormat] = useState("json");



    //CRUD 
    //---------------------------------------------------------------------------------------------------------
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

//--------------------------------------------------------------------------------------------
// Export Data
//--------------------------------------------------------------------------------------------------

    const exportJSON = () => {
        const data = history.filter((item) => selectedItems.includes(item.id));
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
      
        const a = document.createElement("a");
        a.href = url;
        a.download = "history.json";
        a.click();
      };


      const exportCSV = () => {
        const selectedData = history.filter((item) => selectedItems.includes(item.id));
        const csvContent = "data:text/csv;charset=utf-8," +
          "City,Country,Temperature\n" +
          selectedData.map(item => `${item.city},${item.country},${item.temp}`).join("\n");
      
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.href = encodedUri;
        link.download = "history.csv";
        document.body.appendChild(link);
        link.click();
      };

      const exportXML = () => {
        const selectedData = history.filter((item) => selectedItems.includes(item.id));
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?><history>';
      
        selectedData.forEach(item => {
          xmlContent += `<entry><city>${item.city}</city><country>${item.country}</country><temperature>${item.temp}</temperature></entry>`;
        });
      
        xmlContent += "</history>";
      
        const blob = new Blob([xmlContent], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
      
        const a = document.createElement("a");
        a.href = url;
        a.download = "history.xml";
        a.click();
      };

      
      const exportPDF = () => {
        const selectedData = history.filter((item) => selectedItems.includes(item.id));
        const doc = new jsPDF();
      
        doc.text("Weather History", 10, 10);
        selectedData.forEach((item, index) => {
          doc.text(`${index + 1}. ${item.city} (${item.country}) - ${item.temp}°C`, 10, 20 + index * 10);
        });
      
        doc.save("history.pdf");
      };

      const exportData = () => {
        if (selectedItems.length === 0) {
          alert("Please select at least one item.");
          return;
        }
      
        switch (exportFormat) {
          case "json":
            exportJSON();
            break;
          case "csv":
            exportCSV();
            break;
          case "xml":
            exportXML();
            break;
          case "pdf":
            exportPDF();
            break;
          
        }
      };
      
      

     //---------------------------------------------------------------------------------------------------------------------------------------------------------------- 



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
                        <p className="flex-1">📍 {item.city} ({item.country}) : {item.temp}°C</p>
                    </div>
                ))
            )}

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
                        ✅ Validate
                    </button>
                </div>
            )}


        <div className="flex items-center gap-2 mt-4">
            <label className="font-bold">Format :  </label>
            <select 
                className="p-2 border rounded" 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
            >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="pdf">PDF</option>
            </select>
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded ml-4" 
                onClick={exportData}
            >
                📂 Export
            </button>
        </div>

        </div>
            
        
    );
}

export default History;
