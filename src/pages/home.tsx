import { Camera } from "react-camera-pro";
import { useRef, useState } from "react";
import { generateText } from "ai";
import { gemma } from "../providers/lmstudio";

// import { image1 } from "../assets/image1"

export const Home = () => {
    const camera = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [list, setList] = useState<{ productName: string; price: string }[]>([]);
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

    const processProduct = async (photo?: string) => {
        const result = await generateText({
            model: gemma,
            system:
                `você é um assistente de compra` +
                `você vai receber uma imagem de uma etiqueta de preço de um produto e extrair o preço e o nome` +
                `você deve responder apenas com o nome do produto e o preço, sem explicações` +
                `se não conseguir identificar o produto, responda apenas com "Produto não identificado"` +
                `se não conseguir identificar o preço, responda apenas com "Preço não identificado"` +
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

        const response = result.content.map(c => c.text).join('')
        const newList = [...list, { ...JSON.parse(response) }]

        const newTotal = newList.reduce((acc, item) => {
            return acc + parseFloat(item.price.replace(',', '.'))
        }, 0)
        setTotal(newTotal)
        setList(newList)
    };

    return (
        <div>
            <ul>
                {list.map((item) => {
                    return <li key={item.productName}>
                        {item.productName} - {item.price} <br />
                    </li>
                })}
            </ul>
            <h1>{total.toFixed(2)}</h1>
            {/* <button onClick={() => processProduct(image1)}>image1</button> */}
            <button onClick={handleOpenCamera}>Adicionar um novo produto</button>
            {permissionDenied && (
                <div>Permissão da câmera negada. Por favor, permita o acesso à câmera.</div>
            )}
            {cameraOpen && (
                <div>
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
                    <button onClick={handleTakePhoto}>Tirar foto</button>
                </div>
            )}
            {image && (
                <img src={image} alt="Foto tirada" />
            )}
        </div>
    );
};