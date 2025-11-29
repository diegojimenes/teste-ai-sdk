import { Camera } from "react-camera-pro";
import { useRef, useState, useContext } from "react";
import { generateText } from "ai";
import compress from 'compress-base64';
import { ShoppingContext } from "../providers/ShoppingContext";
// import type { ShoppingListItem } from "../providers/ShoppingContext";
import { gemma } from "../providers/lmstudio";

export const ProductScanner: React.FC = () => {
    const { list, setList, setTotal,
        //  checkList, setCheckList 
    } = useContext(ShoppingContext);
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [load, setLoad] = useState(false);

    const handleOpenCamera = async () => {
        setCameraOpen(true);
    };

    const handleTakePhoto = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto();
            setLoad(true)
            compress(photo, {
                width: 200,
                height: 200,
                type: 'image/png',
                max: 200,
                min: 20,
                quality: 0.4,
            }).then((result: any) => {
                setImage(result);
                setCameraOpen(false);
                processProduct(result);
            });
            // new Compressor(blob, {
            //     quality: 0.6,
            //     async success(photo: any) {
            //         console.log(photo)
            //         // const base64 = await blobToBase64(photo);
            // setImage(base64);
            // setCameraOpen(false);
            // processProduct(base64);
            //     },
            //     error(err) {
            //         console.log(err.message);
            //     }
            // })

        }
    };

    // const checkListItem = async (checkList: ShoppingListItem[], productName: string) => {
    //     try {
    //         console.log("Checking for product:", productName);
    //         console.log("Current checkList:", checkList);

    //         const result = await generateText({
    //             model: gemma,
    //             system: `
    //                 Você é um assistente de compras. Sua tarefa é encontrar um item em uma lista de compras que corresponda a um nome de produto fornecido.
    //                 - A lista de compras será fornecida como um array de objetos JSON.
    //                 - O nome do produto a ser encontrado será uma string.
    //                 - Você deve retornar apenas o objeto JSON do item correspondente da lista.
    //                 - Se nenhum item correspondente for encontrado, você deve retornar um objeto JSON com a propriedade "name" como "Produto não encontrado".
    //                 - A correspondência não precisa ser exata, pode ser semântica (por exemplo, "maçã" e "maçã gala").
    //                 - Responda apenas com o objeto JSON simples: {"name": NOME_DO_PRODUTO, "quantidade": QUANTIDADE_DE_ITENS, "purchased": PURCHASED}.
    //             `,
    //             messages: [
    //                 {
    //                     role: 'user',
    //                     content: `Aqui está a lista de compras: ${JSON.stringify(checkList)}. Encontre o item correspondente a "${productName}".`,
    //                 },
    //             ]
    //         });

    //         const response = result.content.map((c: any) => c?.text ?? '').join('');
    //         console.log("AI response:", response);

    //         const parsed = JSON.parse(response);
    //         console.log("Parsed AI response:", parsed);

    //         if (parsed.name === "Produto não encontrado") {
    //             console.log("Product not found in checklist.");
    //             return;
    //         }

    //         const newCheckList = checkList.map(item => {
    //             if (item.name === parsed.name) {
    //                 console.log("Found matching item:", item);
    //                 return { ...item, purchased: true };
    //             }
    //             return item;
    //         });
    //         console.log("New checkList:", newCheckList);

    //         setCheckList(newCheckList);

    //     } catch (error) {
    //         console.error("Error checking list item:", error);
    //     }
    // }

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
            localStorage.setItem('list', JSON.stringify(newList))

            // if (checkList.length > 0) {
            //     await checkListItem(checkList, parsed.productName);
            // }

        } catch (error) {
            console.log(error)
            alert("Error processing product");
        } finally {
            setLoad(false)
        }
    };

    return (
        <div>
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
        </div>
    );
}
