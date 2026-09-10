import { useEffect, useState } from "react";
import axios from "axios";

function Productos() {

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [idCategoria, setIdCategoria] = useState("");

    const cargarProductos = async () => {
        try {
            const respuesta = await axios.get("http://localhost:8080/productos");
            setProductos(respuesta.data);
        } catch (error) {
            console.error("Error al listar productos:", error);
        }
    };

    const cargarCategorias = async () => {
        try {
            const respuesta = await axios.get("http://localhost:8080/categorias");
            setCategorias(respuesta.data);
        } catch (error) {
            console.error("Error al listar categorías:", error);
        }
    };

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    const guardarProducto = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8080/productos", {
                estado: true,
                nombre: nombre,
                descripcion: descripcion,
                precio: Number(precio),
                stock: Number(stock),
                idCategoria: Number(idCategoria)
            });

            setNombre("");
            setDescripcion("");
            setPrecio("");
            setStock("");
            setIdCategoria("");

            cargarProductos();

        } catch (error) {
            console.error("Error al guardar producto:", error);
        }
    };

    return (
        <div>

            <h1>Ingresar Productos</h1>

            <form onSubmit={guardarProducto}>

                <div>
                    <label>Nombre:</label>
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>

                <div>
                    <label>Descripción:</label>
                    <input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div>
                    <label>Precio:</label>
                    <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                    />
                </div>

                <div>
                    <label>Stock:</label>
                    <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>

                <div>
                    <label>Categoría:</label>

                    <select
                        value={idCategoria}
                        onChange={(e) => setIdCategoria(e.target.value)}
                    >
                        <option value="">
                            Seleccione una categoría
                        </option>

                        {categorias.map((categoria) => (
                            <option
                                key={categoria.idCategoria}
                                value={categoria.idCategoria}
                            >
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit">
                    Guardar
                </button>

            </form>

            <h2>Listado de Productos</h2>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                    </tr>
                </thead>

                <tbody>

                    {productos.map((producto) => (
                        <tr key={producto.idProducto}>

                            <td>{producto.nombre}</td>

                            <td>{producto.descripcion}</td>

                            <td>{producto.precio}</td>

                            <td>{producto.stock}</td>

                            <td>
                                {producto.idCategoria?.nombre}
                            </td>

                        </tr>
                    ))}

                </tbody>
            </table>

        </div>
    );
}

export default Productos;
