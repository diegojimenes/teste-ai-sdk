import { Routes, Route } from "react-router";
import { Home } from "../pages/home";
import { ShoppingProvider } from "../providers/ShoppingContext";

export default function AppRoutes() {
    return (
        <ShoppingProvider>
            <Routes>
                <Route index path="/*" element={<Home />} />
            </Routes>
        </ShoppingProvider>
    );
}