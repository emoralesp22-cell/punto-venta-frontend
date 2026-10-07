import { useEffect, useState } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

function Productos() {

    const formInicial = {
        idProducto: null,
        estado: true,
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        idCategoria: ""
    };

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [form, setForm] = useState(formInicial);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const cargarProductos = async () => {
        try {
            const respuesta = await axios.get(
                "http://localhost:8080/productos/activos"
            );

            setProductos(respuesta.data || []);

        } catch (error) {
            console.error("Error al listar productos:", error);
        }
    };

    const cargarCategorias = async () => {
        try {
            const respuesta = await axios.get(
                "http://localhost:8080/categorias/activos"
            );

            setCategorias(
                respuesta.data?.data ||
                respuesta.data ||
                []
            );

        } catch (error) {
            console.error("Error al listar categorías:", error);
        }
    };

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const guardarProducto = async (e) => {
        e.preventDefault();

        try {

            const datos = {
                estado: true,
                nombre: form.nombre,
                descripcion: form.descripcion,
                precio: Number(form.precio),
                stock: Number(form.stock),
                idCategoria: Number(form.idCategoria)
            };

            if (modoEdicion) {

                await axios.put(
                    `http://localhost:8080/productos/${form.idProducto}`,
                    datos
                );

                setMensaje("Producto actualizado correctamente.");

            } else {

                await axios.post(
                    "http://localhost:8080/productos",
                    datos
                );

                setMensaje("Producto guardado correctamente.");
            }

            setForm(formInicial);
            setModoEdicion(false);

            await cargarProductos();

            setTimeout(() => {
                setMensaje("");
            }, 3000);

        } catch (error) {

            console.error(
                "Error al guardar/actualizar producto:",
                error
            );

            setMensaje(
                "Error al guardar o actualizar el producto."
            );
        }
    };

    const editarProducto = (producto) => {

        setForm({
            idProducto:
                producto.idProducto ||
                producto.id,

            estado: producto.estado ?? true,

            nombre:
                producto.nombre || "",

            descripcion:
                producto.descripcion || "",

            precio:
                producto.precio ?? "",

            stock:
                producto.stock ?? "",

            idCategoria:
                producto.idCategoria?.idCategoria ||
                producto.idCategoria?.id ||
                producto.idCategoria ||
                ""
        });

        setModoEdicion(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const cancelarEdicion = () => {

        setForm(formInicial);
        setModoEdicion(false);
        setMensaje("");
    };

    const anularProducto = async (id) => {

        const confirmar = window.confirm(
            "¿Estás seguro de que deseas anular este producto?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await axios.put(
                `http://localhost:8080/productos/anular/${id}`
            );

            setMensaje(
                "Producto anulado correctamente."
            );

            await cargarProductos();

            setTimeout(() => {
                setMensaje("");
            }, 3000);

        } catch (error) {

            console.error(
                "Error al anular producto:",
                error
            );

            setMensaje(
                "No se pudo anular el producto."
            );
        }
    };

    const generarPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(18);

        doc.text(
            "Listado de Productos",
            14,
            20
        );

        doc.setFontSize(10);

        doc.text(
            `Fecha: ${new Date().toLocaleString()}`,
            14,
            28
        );

        const datos = productos.map((producto) => {

            const categoria =
                producto.idCategoria?.nombre ||
                producto.categoria?.nombre ||
                producto.idCategoria ||
                "Sin categoría";

            return [
                producto.nombre || "",
                producto.descripcion || "",
                `Q ${Number(
                    producto.precio || 0
                ).toFixed(2)}`,
                producto.stock ?? 0,
                categoria
            ];
        });

        autoTable(doc, {
            startY: 35,

            head: [[
                "Producto",
                "Descripción",
                "Precio",
                "Stock",
                "Categoría"
            ]],

            body: datos,

            headStyles: {
                fillColor: [16, 185, 129]
            },

            alternateRowStyles: {
                fillColor: [236, 253, 245]
            }
        });

        return doc;
    };

    const exportarPDF = () => {

        const doc = generarPDF();

        doc.save(
            "Listado_de_Productos.pdf"
        );
    };

    const verPDF = () => {

        const doc = generarPDF();

        const blob =
            doc.output("blob");

        const url =
            URL.createObjectURL(blob);

        window.open(
            url,
            "_blank"
        );
    };

    const exportarExcel = async () => {

        const workbook =
            new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet(
                "Productos"
            );

        worksheet.columns = [
            {
                header: "Producto",
                key: "nombre",
                width: 25
            },
            {
                header: "Descripción",
                key: "descripcion",
                width: 35
            },
            {
                header: "Precio",
                key: "precio",
                width: 15
            },
            {
                header: "Stock",
                key: "stock",
                width: 15
            },
            {
                header: "Categoría",
                key: "categoria",
                width: 25
            }
        ];

        productos.forEach((producto) => {

            const categoria =
                producto.idCategoria?.nombre ||
                producto.categoria?.nombre ||
                producto.idCategoria ||
                "Sin categoría";

            worksheet.addRow({
                nombre:
                    producto.nombre || "",

                descripcion:
                    producto.descripcion || "",

                precio:
                    Number(
                        producto.precio || 0
                    ),

                stock:
                    producto.stock ?? 0,

                categoria
            });
        });

        worksheet.getRow(1).font = {
            bold: true,
            color: {
                argb: "FFFFFF"
            }
        };

        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "10B981"
            }
        };

        worksheet.getRow(1).alignment = {
            vertical: "middle",
            horizontal: "center"
        };

        const buffer =
            await workbook.xlsx.writeBuffer();

        const blob = new Blob(
            [buffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const enlace =
            document.createElement("a");

        enlace.href = url;

        enlace.download =
            "Listado_de_Productos.xlsx";

        enlace.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 p-4 md:p-8">

            <div className="max-w-7xl mx-auto">

                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                            <div className="flex items-center gap-3 mb-2">

                                <div className="bg-emerald-400 rounded-2xl p-3 text-2xl">
                                    📦
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold">
                                    Gestión de Productos
                                </h1>

                            </div>

                            <p className="text-emerald-100">
                                Administra los productos de tu punto de venta
                            </p>

                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">

                            <p className="text-emerald-100 text-sm">
                                Productos activos
                            </p>

                            <p className="text-3xl font-bold">
                                {productos.length}
                            </p>

                        </div>

                    </div>

                </div>

                {mensaje && (

                    <div className="mb-6 bg-emerald-100 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-2xl font-semibold shadow">
                        {mensaje}
                    </div>

                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-4">

                        <div className="bg-emerald-50 rounded-3xl shadow-xl overflow-hidden">

                            <div className="bg-emerald-800 text-white p-5">

                                <h2 className="text-xl font-bold">

                                    {modoEdicion
                                        ? "✏️ Editar Producto"
                                        : "➕ Registrar Producto"}

                                </h2>

                                <p className="text-emerald-100 text-sm mt-1">

                                    {modoEdicion
                                        ? "Modifica la información del producto"
                                        : "Ingresa la información del producto"}

                                </p>

                            </div>

                            <form
                                onSubmit={guardarProducto}
                                className="p-6 space-y-5"
                            >

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Nombre del producto"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Descripción
                                    </label>

                                    <textarea
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        placeholder="Descripción"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Precio
                                    </label>

                                    <input
                                        type="number"
                                        name="precio"
                                        step="0.01"
                                        min="0"
                                        value={form.precio}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0.00"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        min="0"
                                        value={form.stock}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">
                                        Categoría
                                    </label>

                                    <select
                                        name="idCategoria"
                                        value={form.idCategoria}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >

                                        <option value="">
                                            Selecciona una categoría
                                        </option>

                                        {categorias.map((categoria) => (

                                            <option
                                                key={
                                                    categoria.idCategoria ||
                                                    categoria.id
                                                }
                                                value={
                                                    categoria.idCategoria ||
                                                    categoria.id
                                                }
                                            >
                                                {categoria.nombre}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
                                >
                                    {modoEdicion
                                        ? "💾 Actualizar Producto"
                                        : "💾 Guardar Producto"}
                                </button>

                                {modoEdicion && (

                                    <button
                                        type="button"
                                        onClick={cancelarEdicion}
                                        className="w-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold py-3 rounded-xl transition"
                                    >
                                        ✖ Cancelar edición
                                    </button>

                                )}

                            </form>

                        </div>

                    </div>
                    {/* LISTADO */}

                    <div className="lg:col-span-8">

                        <div className="bg-emerald-50 rounded-3xl shadow-xl overflow-hidden">

                            <div className="bg-emerald-800 text-white p-5">

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                    <div>

                                        <h2 className="text-xl font-bold">
                                            📋 Listado de Productos
                                        </h2>

                                        <p className="text-emerald-100 text-sm">
                                            Productos activos registrados
                                        </p>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        <button
                                            onClick={exportarPDF}
                                            className="bg-emerald-950 hover:bg-black text-white px-4 py-2 rounded-xl font-semibold transition"
                                        >
                                            📄 PDF
                                        </button>

                                        <button
                                            onClick={verPDF}
                                            className="bg-white hover:bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl font-semibold transition"
                                        >
                                            👁️ Ver PDF
                                        </button>

                                        <button
                                            onClick={exportarExcel}
                                            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                                        >
                                            📊 Excel
                                        </button>

                                    </div>

                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead className="bg-emerald-800 text-white">

                                        <tr>

                                            <th className="px-4 py-4 text-left">
                                                Producto
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Descripción
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Precio
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Stock
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Categoría
                                            </th>

                                            <th className="px-4 py-4 text-center">
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {productos.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="6"
                                                    className="text-center py-10 text-emerald-700"
                                                >
                                                    No hay productos activos registrados.
                                                </td>

                                            </tr>

                                        ) : (

                                            productos.map((producto, index) => {

                                                const categoria =
                                                    producto.idCategoria?.nombre ||
                                                    producto.categoria?.nombre ||
                                                    producto.idCategoria ||
                                                    "Sin categoría";

                                                const idProducto =
                                                    producto.idProducto ||
                                                    producto.id;

                                                return (

                                                    <tr
                                                        key={idProducto || index}
                                                        className={
                                                            index % 2 === 0
                                                                ? "bg-white hover:bg-emerald-100 transition"
                                                                : "bg-emerald-50 hover:bg-emerald-100 transition"
                                                        }
                                                    >

                                                        <td className="px-4 py-4 font-semibold text-emerald-950">
                                                            {producto.nombre}
                                                        </td>

                                                        <td className="px-4 py-4 text-gray-700">
                                                            {producto.descripcion || "—"}
                                                        </td>

                                                        <td className="px-4 py-4 font-bold text-emerald-700">
                                                            Q{" "}
                                                            {Number(
                                                                producto.precio || 0
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td className="px-4 py-4">

                                                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                                                {producto.stock ?? 0}
                                                            </span>

                                                        </td>

                                                        <td className="px-4 py-4 text-gray-700">
                                                            {categoria}
                                                        </td>

                                                        <td className="px-4 py-4">

                                                            <div className="flex flex-col sm:flex-row justify-center gap-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        editarProducto(
                                                                            producto
                                                                        )
                                                                    }
                                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-semibold transition"
                                                                >
                                                                    ✏️ Editar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        anularProducto(
                                                                            idProducto
                                                                        )
                                                                    }
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl font-semibold transition"
                                                                >
                                                                    🚫 Anular
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            })

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="bg-emerald-100/70 px-5 py-4 text-sm text-emerald-800">

                                Total de productos activos:{" "}
                                <strong>
                                    {productos.length}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Productos;
