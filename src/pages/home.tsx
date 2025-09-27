import { Camera } from "react-camera-pro";
import { useRef, useState } from "react";
import { generateText } from "ai";
import { gemma } from "../providers/lmstudio";

export const Home = () => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [load, setLoad] = useState(false);
    const [checkList, setCheckList] = useState<{
        name: string;
        quantidade: number;
    }[]>([]);
    const [list, setList] = useState<{
        productName: string;
        price: string;
        unitPrice: string;
        quantidade: number;
    }[]>([]);

    const [total, setTotal] = useState(0)

    const handleOpenCamera = async () => {
        setCameraOpen(true);
    };




    const handleTakePhoto = () => {
        if (camera.current) {
            const photo = camera.current.takePhoto();
            setImage(photo);
            setCameraOpen(false);
            processProduct(photo);
        }
    };

    const checkListItes = async (checklist: any, newList: any) => {
        try {
            const result = await generateText({
                model: gemma,
                system:
                    `você é um assistente de compra` +
                    `você vai receber uma lista de comprar e uma lista com os itens que ja foram comprados` +
                    `você deve responder apenas com a lista de itens que faltam comprar, sem explicações` +
                    `se todos os itens ja foram comprados, responda apenas com "Todos os itens ja foram comprados"` +
                    `sempre responda no formato: 
                    - item1
                    - item2
                    - item3`,
                prompt: `
                lista de compras: ${JSON.stringify(checklist)}
                itens ja comprados: ${JSON.stringify(newList)}
                `
            });

            const response = result.content.map((c: any) => c?.text ?? '').join('')

            alert(response)
        } catch (error) {
            alert("Error processing product");
        }
    }

    const processProduct = async (photo?: string) => {
        try {
            setLoad(true)
            const result = await generateText({
                model: gemma,
                system:
                    `você é um assistente de compra` +
                    `você vai receber uma imagem de uma etiqueta de preço de um produto e extrair o preço e o nome` +
                    `você deve responder apenas com o nome do produto e o preço, sem explicações` +
                    `se não conseguir identificar o produto, responda apenas com "Produto não identificado"` +
                    `se não conseguir identificar o preço, responda apenas com "Preço não identificado"` +
                    `caso tenha preço para atacado e varejo sempre escolha o preço do varejo` +
                    `se não conseguir identificar nenhum dos dois, responda apenas com "Produto e preço não identificados"` +
                    `sempre responda no formato: {"productName": nome do produto, "price": preço} para o preço sempre use ponto em vez de virgula ex: 99.99 1.00 999.000.999"`,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                image: photo
                            },
                        ],
                    },
                ]
            });

            const response = result.content.map((c: any) => c?.text ?? '').join('')
            if (response.includes("Produto não identificado")
                || response.includes("Preço não identificado")
                || response.includes("Produto e preço não identificados")) {
                alert("Não foi possível identificar o produto ou o preço, tente novamente");
                return;
            }
            const parsed = JSON.parse(response)

            if (!parsed.productName || !parsed.price) {
                alert("Não foi possível identificar o produto ou o preço, tente novamente");
                return;
            }

            const quantidade = parseInt(prompt("Qual a quantidade?") || "1")

            const newList = [...list, {
                productName: parsed.productName,
                unitPrice: parsed.price,
                price: (parseFloat(parsed.price.replace(',', '.')) * quantidade).toFixed(2),
                quantidade: quantidade
            }]

            const newTotal = newList.reduce((acc, item) => {
                return acc + parseFloat(item.price.replace(',', '.'))
            }, 0)

            setTotal(newTotal)
            setList(newList)

            // await checkListItes(checkList, newList)
        } catch (error) {
            alert("Error processing product");
        } finally {
            setLoad(false)
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ddd", borderRadius: 8, background: "#fafafa" }}>
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
                                    setList(list.filter((_, i) => i !== index))
                                    const newTotal = list.filter((_, i) => i !== index).reduce((acc, item) => {
                                        return acc + parseFloat(item.price.replace(',', '.'))
                                    }, 0)
                                    setTotal(newTotal)
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
                onClick={handleOpenCamera}
            >
                Adicionar um novo produto
            </button>
            {cameraOpen && (
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                    <Camera
                        ref={camera}
                        facingMode='environment'
                        aspectRatio={16 / 9}
                        errorMessages={{
                            noCameraAccessible: "Câmera não acessível",
                            permissionDenied: "Permissão negada",
                            switchCamera: "Trocar câmera",
                            canvas: "Erro no canvas"
                        }}
                    />
                    {
                        load ? <span style={{ display: "block", margin: "12px 0", color: "#888" }}>Processando...</span>
                            : <button
                                style={{ marginTop: 12, padding: "8px 16px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                                onClick={handleTakePhoto}
                            >
                                Tirar foto
                            </button>
                    }
                </div>
            )}
            {load && <span style={{ display: "block", margin: "12px 0", color: "#888" }}>Processando...</span>}
            {image && (
                <img src={image} alt="Foto tirada" style={{ width: "100%", marginTop: 16, borderRadius: 8, border: "1px solid #ccc" }} />
            )}

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
                        setCheckList([...checkList, { name, quantidade }])
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
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8
                                }}
                            >
                                <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                                    {item.name}
                                </span>
                                <span style={{ color: "#7f8c8d" }}>
                                    x {item.quantidade}
                                </span>
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
        </div>
    );
};