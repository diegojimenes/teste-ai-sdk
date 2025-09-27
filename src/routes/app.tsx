import { Routes, Route } from "react-router";
import { Home } from "../pages/home";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index path="/*" element={<Home />} />
        </Routes>
    );
}