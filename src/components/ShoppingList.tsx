import React, { useContext } from 'react';
import { ShoppingContext } from '../providers/ShoppingContext';

export const ShoppingList: React.FC = () => {
    const { checkList, setCheckList } = useContext(ShoppingContext);

    return (
        <div style={{ marginTop: 32, padding: 20, border: "1px solid #eee", borderRadius: 8, background: "#f5f5f5" }}>
            <h2 style={{ marginBottom: 16, color: "#34495e", textAlign: "center" }}>
                Lista de compras
            </h2>

            <button
                style={{
                    display: "block",
                    margin: "0 auto 16px",
                    padding: "8px 16px",
                    background: "#8e44ad",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 15,
                    cursor: "pointer"
                }}
                onClick={() => {
                    const name = prompt("Nome do item")
                    const quantidade = parseInt(prompt("Quantidade") || "1")
                    if (!name) return alert("Nome é obrigatório")
                    if (quantidade <= 0 || isNaN(quantidade)) return alert("Quantidade inválida")
                    setCheckList([...checkList, { name, quantidade, purchased: false }])
                }}
            >
                Adicionar item
            </button>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {checkList.map((item, index) => {
                    return (
                        <li
                            key={index}
                            style={{
                                marginBottom: 12,
                                padding: 10,
                                border: "1px solid #ddd",
                                borderRadius: 6,
                                background: item.purchased ? "#e8f5e9" : "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                textDecoration: item.purchased ? "line-through" : "none"
                            }}
                        >
                            <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                                {item.name}
                            </span>
                            <span style={{ color: "#7f8c8d" }}>
                                x {item.quantidade}
                            </span>
                            {item.purchased && <span style={{ color: "#27ae60" }}>✓</span>}
                            <button
                                style={{
                                    padding: "6px 12px",
                                    background: "#e74c3c",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    setCheckList(checkList.filter((_, i) => i !== index))
                                }}
                            >
                                Deletar
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}