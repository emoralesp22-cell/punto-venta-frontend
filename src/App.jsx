import { Routes, Route } from "react-router-dom";

import Categorias from "./pages/Categorias.jsx";
import Productos from "./pages/Productos.jsx";
import Clientes from "./pages/Clientes.jsx";

function App() {
    return (
        <Routes>

            <Route
                path="/categorias"
                element={<Categorias />}
            />

            <Route
                path="/productos"
                element={<Productos />}
            />

            <Route
                path="/clientes"
                element={<Clientes />}
            />

        </Routes>
    );
}

export default App;
