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
            const respuesta = await axios.get(
                "http://localhost:8080/productos"
            );
            setProductos(respuesta.data);
        } catch (error) {
            console.error("Error al listar productos:", error);
        }
    };

    const cargarCategorias = async () => {
        try {
            const respuesta = await axios.get(
                "http://localhost:8080/categorias"
            );
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
                nombre,
                descripcion,
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
        <div className="min-h-screen bg-slate-100 p-8">

            {/* TÍTULO */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Gestión de Productos
                </h1>

                <p className="mt-1 text-slate-500">
                    Registra y administra los productos del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* FORMULARIO */}
                <div className="rounded-2xl bg-white p-6 shadow-lg">

                    <h2 className="mb-6 text-xl font-bold text-slate-700">
                        Nuevo Producto
                    </h2>

                    <form onSubmit={guardarProducto} className="space-y-4">

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre del producto"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Descripción
                            </label>

                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción del producto"
                                className="h-24 w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-600">
                                    Precio
                                </label>

                                <input
                                    type="number"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-600">
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Categoría
                            </label>

                            <select
                                value={idCategoria}
                                onChange={(e) => setIdCategoria(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            + Guardar Producto
                        </button>

                    </form>
                </div>

                {/* TABLA */}
                <div className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-slate-700">
                                Listado de Productos
                            </h2>

                            <p className="text-sm text-slate-500">
                                Productos registrados
                            </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                            {productos.length} productos
                        </span>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Descripción</th>
                                    <th className="px-4 py-3">Precio</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Categoría</th>
                                </tr>
                            </thead>

                            <tbody>

                                {productos.map((producto) => (

                                    <tr
                                        key={producto.idProducto}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >

                                        <td className="px-4 py-4 font-semibold text-slate-700">
                                            {producto.nombre}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500">
                                            {producto.descripcion}
                                        </td>

                                        <td className="px-4 py-4 font-bold text-blue-600">
                                            Q {producto.precio}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                {producto.stock}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                                                {producto.idCategoria?.nombre}
                                            </span>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Productos;
