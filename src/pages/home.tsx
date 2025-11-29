import { ProductScanner } from "../components/ProductScanner";
import { ScannedProductList } from "../components/ScannedProductList";
// import { ShoppingList } from "../components/ShoppingList";
import "./home.css";

export const Home = () => {
    return (
        <div className="home-container">
            {/* <div className="shopping-list-container">
                <ShoppingList />
            </div> */}
            <div className="scanner-container">
                <ProductScanner />
                <ScannedProductList />
            </div>
        </div>
    );
};