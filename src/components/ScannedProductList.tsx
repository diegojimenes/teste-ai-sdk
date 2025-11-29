import React, { useContext } from 'react';
import { ShoppingContext } from '../providers/ShoppingContext';

export const ScannedProductList: React.FC = () => {
    const { list, setList, total, setTotal } = useContext(ShoppingContext);

    const exportToClipboard = async () => {
        navigator.clipboard.writeText(JSON.stringify(list)).then(() => {
            alert("Texto copiado para a área de transferência!");
        })
    }

    const clearList = () => {
        if (confirm("Tem certeza que deseja limpar a lista de compras? Esta ação não pode ser desfeita.")) {
            setList([])
            setTotal(0)
            localStorage.removeItem('list')
        }
    }

    return (
        <div>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {list.map((item, index) => {
                    return (
                        <li key={item.productName} style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontWeight: "bold" }}>{item.productName}</span>
                            <span>Preço unitário: <b>{item.unitPrice}</b></span>
                            <span>Quantidade: <b>{item.quantidade}</b></span>
                            <button
                                style={{ marginTop: 8, padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                onClick={() => {
                                    const newList = list.filter((_, i) => i !== index)
                                    setList(newList)
                                    const newTotal = newList.reduce((acc, item) => {
                                        return acc + parseFloat(item.price.replace(',', '.'))
                                    }, 0)
                                    setTotal(newTotal)
                                    localStorage.setItem('list', JSON.stringify(newList))
                                }}
                            >
                                Deletar
                            </button>
                        </li>
                    )
                })}
            </ul>
            <h1 style={{ textAlign: "center", color: "#2ecc71", margin: "24px 0 16px" }}>Total: R$ {total.toFixed(2)}</h1>
            <button
                style={{ display: "block", width: "100%", padding: "10px 0", background: "#3498db", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer", marginBottom: 16 }}
                onClick={exportToClipboard}
            >
                Copiar lista de compras
            </button>
            <button
                style={{ display: "block", width: "100%", padding: "10px 0", background: "#3498db", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer", marginBottom: 16 }}
                onClick={clearList}
            >
                Limpar lista de compras
            </button>
        </div>
    );
}