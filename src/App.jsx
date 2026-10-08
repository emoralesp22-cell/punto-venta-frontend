import { Routes, Route, Navigate } from "react-router-dom";

import Categorias from "./pages/Categorias.jsx";
import Productos from "./pages/Productos.jsx";
import Clientes from "./pages/Clientes.jsx";
import Reportes from "./pages/Reportes.jsx";

function App() {
    return (
        <Routes>

            {/* Página principal */}
            <Route
                path="/"
                element={<Navigate to="/categorias" replace />}
            />

            {/* Categorías */}
            <Route
                path="/categorias"
                element={<Categorias />}
            />

            {/* Productos */}
            <Route
                path="/productos"
                element={<Productos />}
            />

            {/* Clientes */}
            <Route
                path="/clientes"
                element={<Clientes />}
            />

            {/* Reportes */}
            <Route
                path="/reportes"
                element={<Reportes />}
            />

        </Routes>
    );
}

export default App;