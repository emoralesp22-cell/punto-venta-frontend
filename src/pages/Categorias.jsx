import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    listarCategoriasActivas,
    crearCategoria,
    actualizarCategoria,
    anularCategoria
} from "../services/categoriaService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

const formInicial = {
    idCategoria: null,
    nombre: "",
    descripcion: ""
};

function Categorias() {

    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState(formInicial);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const cargarCategorias = async () => {

        try {

            const respuesta = await listarCategoriasActivas();

            const lista =
                respuesta.data?.data ||
                respuesta.data ||
                [];

            setCategorias(lista);

        } catch (error) {

            console.error(
                "Error al listar categorías",
                error
            );

        }

    };

    useEffect(() => {

        cargarCategorias();

    }, []);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const idActual =
                form.idCategoria ||
                form.id;

            if (modoEdicion) {

                await actualizarCategoria(
                    idActual,
                    form
                );

                setMensaje(
                    "Categoría actualizada correctamente."
                );

            } else {

                await crearCategoria(form);

                setMensaje(
                    "Categoría creada correctamente."
                );

            }

            setForm(formInicial);
            setModoEdicion(false);

            cargarCategorias();

            setTimeout(() => {

                setMensaje("");

            }, 3000);

        } catch (error) {

            console.error(
                "Error al guardar categoría",
                error
            );

            setMensaje(
                "Ocurrió un error al procesar la solicitud."
            );

        }

    };

    const handleEditar = (categoria) => {

        setForm({
            ...categoria,
            idCategoria:
                categoria.idCategoria ||
                categoria.id
        });

        setModoEdicion(true);

    };

    const handleEliminar = async (id) => {

        if (
            !window.confirm(
                "¿Seguro que deseas eliminar esta categoría?"
            )
        ) {

            return;

        }

        try {

            await anularCategoria(id);

            setMensaje(
                "Categoría eliminada correctamente."
            );

            cargarCategorias();

            setTimeout(() => {

                setMensaje("");

            }, 3000);

        } catch (error) {

            console.error(
                "Error al eliminar categoría",
                error
            );

            setMensaje(
                "No se pudo eliminar la categoría."
            );

        }

    };

    const handleCancelar = () => {

        setForm(formInicial);
        setModoEdicion(false);

    };

    // =========================
    // PDF
    // =========================

    const generarPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(18);

        doc.text(
            "Listado de Categorías",
            14,
            20
        );

        doc.setFontSize(10);

        doc.text(
            `Fecha: ${new Date().toLocaleDateString()}`,
            14,
            28
        );

        const datos = categorias.map(
            (categoria) => [
                categoria.nombre,
                categoria.descripcion || "-"
            ]
        );

        autoTable(doc, {

            startY: 35,

            head: [
                [
                    "Nombre",
                    "Descripción"
                ]
            ],

            body: datos,

            theme: "grid",

            headStyles: {
                fillColor: [16, 185, 129],
                textColor: 255
            },

            styles: {
                fontSize: 10
            }

        });

        return doc;

    };

    const exportarPDF = () => {

        const doc = generarPDF();

        doc.save(
            "Listado_de_Categorias.pdf"
        );

    };

    const verPDF = () => {

        const doc = generarPDF();

        const pdfBlob =
            doc.output("blob");

        const url =
            URL.createObjectURL(pdfBlob);

        window.open(
            url,
            "_blank"
        );

    };

    // =========================
    // EXCEL
    // =========================

    const exportarExcel = async () => {

        const workbook =
            new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet(
                "Categorías"
            );

        worksheet.columns = [

            {
                header: "Nombre",
                key: "nombre",
                width: 30
            },

            {
                header: "Descripción",
                key: "descripcion",
                width: 45
            }

        ];

        categorias.forEach(
            (categoria) => {

                worksheet.addRow({

                    nombre:
                        categoria.nombre,

                    descripcion:
                        categoria.descripcion ||
                        "-"

                });

            }
        );

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
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "Listado_de_Categorias.xlsx";

        link.click();

        window.URL.revokeObjectURL(url);

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 p-4 md:p-8">

            <div className="mx-auto max-w-7xl">

                {/* ENCABEZADO */}

                <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 p-7 shadow-2xl">

                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10"></div>

                    <div className="absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-teal-300/10"></div>

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div>

                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200">

                                <span className="h-2 w-2 rounded-full bg-emerald-300"></span>

                                Punto de Venta

                            </div>

                            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">

                                Gestión de Categorías

                            </h1>

                            <p className="mt-2 text-sm text-emerald-100 md:text-base">

                                Administra las categorías registradas
                                en tu sistema.

                            </p>

                        </div>

                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">

                            <button
                                type="button"
                                onClick={() => navigate("/reportes")}
                                className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-xl"
                            >
                                📊 Reportes
                            </button>

                            <div className="rounded-2xl border border-white/10 bg-white/10 px-7 py-5 text-center shadow-lg backdrop-blur">

                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">

                                    Categorías activas

                                </p>

                                <p className="mt-1 text-4xl font-black text-white">

                                    {categorias.length}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* MENSAJE */}

                {mensaje && (

                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-md">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-200 font-black text-emerald-800">

                            ✓

                        </div>

                        <span className="font-semibold">

                            {mensaje}

                        </span>

                    </div>

                )}

                {/* CONTENIDO */}

                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">

                    {/* FORMULARIO */}

                    <div className="lg:col-span-4">

                        <div className="overflow-hidden rounded-3xl border border-emerald-200/70 bg-emerald-50 shadow-xl">

                            <div className="border-b border-emerald-700 bg-emerald-800 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-2xl font-black text-emerald-950 shadow-lg">

                                        {modoEdicion
                                            ? "✎"
                                            : "+"}

                                    </div>

                                    <div>

                                        <h2 className="text-xl font-black text-white">

                                            {modoEdicion
                                                ? "Modificar categoría"
                                                : "Nueva categoría"}

                                        </h2>

                                        <p className="mt-1 text-sm text-emerald-200">

                                            {modoEdicion
                                                ? "Actualiza los datos"
                                                : "Registra una categoría"}

                                        </p>

                                    </div>

                                </div>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5 p-6"
                            >

                                <div>

                                    <label
                                        htmlFor="nombre"
                                        className="mb-2 block text-sm font-black text-emerald-950"
                                    >
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej. Bebidas"
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3.5 text-emerald-950 shadow-sm outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                                    />

                                </div>

                                <div>

                                    <label
                                        htmlFor="descripcion"
                                        className="mb-2 block text-sm font-black text-emerald-950"
                                    >
                                        Descripción
                                    </label>

                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        placeholder="Descripción de la categoría..."
                                        rows="5"
                                        className="w-full resize-none rounded-xl border border-emerald-200 bg-white px-4 py-3.5 text-emerald-950 shadow-sm outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                                    />

                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-emerald-600 px-5 py-3.5 font-black text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
                                    >
                                        {modoEdicion
                                            ? "Actualizar"
                                            : "Guardar categoría"}
                                    </button>

                                    {modoEdicion && (

                                        <button
                                            type="button"
                                            onClick={handleCancelar}
                                            className="rounded-xl border border-emerald-200 bg-white px-5 py-3.5 font-bold text-emerald-800 transition hover:bg-emerald-100"
                                        >
                                            Cancelar
                                        </button>

                                    )}

                                </div>

                            </form>

                        </div>

                    </div>

                    {/* LISTADO */}

                    <div className="lg:col-span-8">

                        <div className="overflow-hidden rounded-3xl border border-emerald-200/70 bg-emerald-50 shadow-xl">

                            <div className="border-b border-emerald-200 bg-emerald-100/80 px-6 py-5">

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-xl text-white shadow-md">

                                            ☷

                                        </div>

                                        <div>

                                            <h2 className="text-xl font-black text-emerald-950">

                                                Categorías registradas

                                            </h2>

                                            <p className="text-sm font-medium text-emerald-700">

                                                {categorias.length}
                                                {" "}
                                                categorías activas

                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        <button
                                            type="button"
                                            onClick={exportarPDF}
                                            className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-lg"
                                        >
                                            PDF
                                        </button>

                                        <button
                                            type="button"
                                            onClick={verPDF}
                                            className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-black text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
                                        >
                                            Ver PDF
                                        </button>

                                        <button
                                            type="button"
                                            onClick={exportarExcel}
                                            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg"
                                        >
                                            Excel
                                        </button>

                                    </div>

                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="bg-emerald-800 text-left text-xs uppercase tracking-wider text-emerald-50">

                                            <th className="px-6 py-4 font-black">
                                                Categoría
                                            </th>

                                            <th className="px-6 py-4 font-black">
                                                Descripción
                                            </th>

                                            <th className="px-6 py-4 text-center font-black">
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-emerald-100">

                                        {categorias.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="3"
                                                    className="px-6 py-16 text-center"
                                                >

                                                    <p className="font-bold text-emerald-800">

                                                        No hay categorías registradas.

                                                    </p>

                                                </td>

                                            </tr>

                                        ) : (

                                            categorias.map(
                                                (categoria, index) => {

                                                    const idValido =
                                                        categoria.idCategoria ||
                                                        categoria.id;

                                                    return (

                                                        <tr
                                                            key={idValido}
                                                            className={`transition hover:bg-emerald-100 ${
                                                                index % 2 === 0
                                                                    ? "bg-white"
                                                                    : "bg-emerald-50"
                                                            }`}
                                                        >

                                                            <td className="px-6 py-5">

                                                                <div className="flex items-center gap-3">

                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 font-black text-emerald-800">

                                                                        {categoria.nombre
                                                                            ?.charAt(0)
                                                                            ?.toUpperCase()}

                                                                    </div>

                                                                    <div>

                                                                        <p className="font-black text-emerald-950">

                                                                            {categoria.nombre}

                                                                        </p>

                                                                        <p className="text-xs font-medium text-emerald-600">

                                                                            ID #{idValido}

                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </td>

                                                            <td className="px-6 py-5 text-sm font-medium text-emerald-900">

                                                                {categoria.descripcion || "-"}

                                                            </td>

                                                            <td className="px-6 py-5">

                                                                <div className="flex justify-center gap-2">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditar(categoria)
                                                                        }
                                                                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                                                                    >
                                                                        Editar
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEliminar(idValido)
                                                                        }
                                                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                                                    >
                                                                        Anular
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="border-t border-emerald-200 bg-emerald-100/70 px-6 py-4">

                                <div className="flex flex-col gap-1 text-xs font-semibold text-emerald-700 sm:flex-row sm:items-center sm:justify-between">

                                    <span>
                                        Sistema de Punto de Venta
                                    </span>

                                    <span>
                                        {categorias.length}
                                        {" "}
                                        registros activos
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Categorias;