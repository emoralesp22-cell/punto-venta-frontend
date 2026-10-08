import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reportes() {

    const [mostrarDialogo, setMostrarDialogo] = useState(false);
    const [tipoReporte, setTipoReporte] = useState("");
    const [textoFiltro, setTextoFiltro] = useState("");
    const [cargando, setCargando] = useState(false);


    // =========================================================
    // ABRIR PDF EN UNA NUEVA PESTAÑA
    // =========================================================

    const abrirPDF = (doc, ventana, nombreArchivo) => {

        const blob = doc.output("blob");

        const url = URL.createObjectURL(blob);

        if (ventana) {

            ventana.location.href = url;
            ventana.document.title = nombreArchivo;

        } else {

            window.open(url, "_blank");

        }

        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 60000);

    };


    // =========================================================
    // REPORTE GENERAL DE PRODUCTOS
    // =========================================================

    const reporteProductos = async () => {

        // Abrimos la pestaña inmediatamente para evitar
        // que el navegador bloquee la ventana emergente.

        const ventana = window.open(
            "",
            "_blank"
        );

        try {

            setCargando(true);

            const respuesta = await axios.get(
                "http://localhost:8080/productos/activos"
            );

            const productos =
                respuesta.data || [];

            const doc =
                generarPDFProductos(
                    productos,
                    "Reporte General de Productos"
                );

            abrirPDF(
                doc,
                ventana,
                "Reporte_Productos.pdf"
            );

        } catch (error) {

            console.error(
                "Error al generar reporte de productos:",
                error
            );

            if (ventana) {
                ventana.close();
            }

            alert(
                "No se pudo generar el reporte de productos."
            );

        } finally {

            setCargando(false);

        }

    };


    // =========================================================
    // REPORTE GENERAL DE CATEGORÍAS
    // =========================================================

    const reporteCategorias = async () => {

        const ventana = window.open(
            "",
            "_blank"
        );

        try {

            setCargando(true);

            const respuesta = await axios.get(
                "http://localhost:8080/categorias/activos"
            );

            const categorias =
                respuesta.data || [];

            const doc =
                generarPDFCategorias(
                    categorias,
                    "Reporte General de Categorías"
                );

            abrirPDF(
                doc,
                ventana,
                "Reporte_Categorias.pdf"
            );

        } catch (error) {

            console.error(
                "Error al generar reporte de categorías:",
                error
            );

            if (ventana) {
                ventana.close();
            }

            alert(
                "No se pudo generar el reporte de categorías."
            );

        } finally {

            setCargando(false);

        }

    };


    // =========================================================
    // ABRIR DIÁLOGO
    // =========================================================

    const abrirDialogo = (tipo) => {

        setTipoReporte(tipo);

        setTextoFiltro("");

        setMostrarDialogo(true);

    };


    // =========================================================
    // CERRAR DIÁLOGO
    // =========================================================

    const cerrarDialogo = () => {

        setMostrarDialogo(false);

        setTextoFiltro("");

        setTipoReporte("");

    };


    // =========================================================
    // GENERAR REPORTE FILTRADO
    // =========================================================

    const generarReporteFiltrado = async () => {

        if (!textoFiltro.trim()) {

            alert(
                "Ingrese un texto para realizar el filtro."
            );

            return;

        }

        const ventana = window.open(
            "",
            "_blank"
        );

        try {

            setCargando(true);

            if (tipoReporte === "productos") {

                const respuesta =
                    await axios.get(
                        `http://localhost:8080/productos/activos/filtro?filtro=${encodeURIComponent(textoFiltro)}`
                    );

                const productos =
                    respuesta.data || [];

                const doc =
                    generarPDFProductos(
                        productos,
                        `Reporte de Productos - "${textoFiltro}"`
                    );

                cerrarDialogo();

                abrirPDF(
                    doc,
                    ventana,
                    "Reporte_Productos_Filtrado.pdf"
                );

            }

            else if (tipoReporte === "categorias") {

                const respuesta =
                    await axios.get(
                        `http://localhost:8080/categorias/activos/filtro?filtro=${encodeURIComponent(textoFiltro)}`
                    );

                const categorias =
                    respuesta.data || [];

                const doc =
                    generarPDFCategorias(
                        categorias,
                        `Reporte de Categorías - "${textoFiltro}"`
                    );

                cerrarDialogo();

                abrirPDF(
                    doc,
                    ventana,
                    "Reporte_Categorias_Filtrado.pdf"
                );

            }

        } catch (error) {

            console.error(
                "Error al generar reporte filtrado:",
                error
            );

            if (ventana) {
                ventana.close();
            }

            alert(
                "No se pudo generar el reporte."
            );

        } finally {

            setCargando(false);

        }

    };


    // =========================================================
    // CREAR PDF DE PRODUCTOS
    // =========================================================

    const generarPDFProductos = (
        productos,
        titulo
    ) => {

        const doc =
            new jsPDF(
                "landscape"
            );

        // Título

        doc.setFontSize(20);

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            titulo,
            14,
            18
        );


        // Fecha

        doc.setFontSize(10);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            `Fecha: ${new Date().toLocaleString()}`,
            14,
            26
        );


        // Total

        doc.text(
            `Total de productos: ${productos.length}`,
            14,
            32
        );


        // Sin resultados

        if (
            productos.length === 0
        ) {

            doc.setFontSize(13);

            doc.text(
                "No se encontraron productos.",
                14,
                48
            );

            return doc;

        }


        // Datos de la tabla

        const filas =
            productos.map(
                (producto) => {

                    const categoria =
                        producto.categoria?.nombre ||
                        producto.idCategoria?.nombre ||
                        producto.nombreCategoria ||
                        producto.idCategoria ||
                        "Sin categoría";

                    return [

                        producto.idProducto ??
                        producto.id ??
                        "",

                        producto.nombre ??
                        "",

                        producto.descripcion ??
                        "",

                        producto.precio ??
                        "",

                        producto.stock ??
                        "",

                        categoria

                    ];

                }
            );


        // Tabla

        autoTable(
            doc,
            {

                startY: 40,

                head: [[

                    "ID",

                    "Nombre",

                    "Descripción",

                    "Precio",

                    "Stock",

                    "Categoría"

                ]],

                body: filas,

                theme: "grid",

                headStyles: {

                    fillColor: [
                        16,
                        185,
                        129
                    ],

                    textColor: 255,

                    fontStyle: "bold"

                },

                alternateRowStyles: {

                    fillColor: [
                        236,
                        253,
                        245
                    ]

                },

                styles: {

                    fontSize: 8,

                    cellPadding: 3

                },

                columnStyles: {

                    0: {
                        cellWidth: 15
                    },

                    1: {
                        cellWidth: 35
                    },

                    2: {
                        cellWidth: 75
                    },

                    3: {
                        cellWidth: 25
                    },

                    4: {
                        cellWidth: 20
                    },

                    5: {
                        cellWidth: 40
                    }

                }

            }
        );


        return doc;

    };


    // =========================================================
    // CREAR PDF DE CATEGORÍAS
    // =========================================================

    const generarPDFCategorias = (
        categorias,
        titulo
    ) => {

        const doc =
            new jsPDF();

        // Título

        doc.setFontSize(20);

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            titulo,
            14,
            20
        );


        // Fecha

        doc.setFontSize(10);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            `Fecha: ${new Date().toLocaleString()}`,
            14,
            28
        );


        // Total

        doc.text(
            `Total de categorías: ${categorias.length}`,
            14,
            34
        );


        // Sin resultados

        if (
            categorias.length === 0
        ) {

            doc.setFontSize(13);

            doc.text(
                "No se encontraron categorías.",
                14,
                50
            );

            return doc;

        }


        // Datos

        const filas =
            categorias.map(
                (categoria) => [

                    categoria.idCategoria ??
                    categoria.id ??
                    "",

                    categoria.nombre ??
                    "",

                    categoria.descripcion ??
                    ""

                ]
            );


        // Tabla

        autoTable(
            doc,
            {

                startY: 42,

                head: [[

                    "ID",

                    "Nombre",

                    "Descripción"

                ]],

                body: filas,

                theme: "grid",

                headStyles: {

                    fillColor: [
                        16,
                        185,
                        129
                    ],

                    textColor: 255,

                    fontStyle: "bold"

                },

                alternateRowStyles: {

                    fillColor: [
                        236,
                        253,
                        245
                    ]

                },

                styles: {

                    fontSize: 9,

                    cellPadding: 4

                }

            }
        );


        return doc;

    };


    // =========================================================
    // INTERFAZ
    // =========================================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 p-6">

            <div className="max-w-6xl mx-auto">

                {/* ENCABEZADO */}

                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 rounded-3xl shadow-2xl p-8 mb-8 text-white">

                    <h1 className="text-4xl font-bold">

                        Reportes

                    </h1>

                    <p className="mt-2 text-emerald-100">

                        Generación de reportes de productos y categorías

                    </p>

                </div>


                {/* BOTONES */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* PRODUCTOS */}

                    <button
                        type="button"
                        onClick={reporteProductos}
                        disabled={cargando}
                        className="bg-white rounded-3xl shadow-xl p-8 text-left hover:shadow-2xl hover:-translate-y-1 transition-all border border-emerald-100 disabled:opacity-60 disabled:cursor-wait"
                    >

                        <div className="flex items-center gap-4">

                            <div className="bg-emerald-100 text-emerald-700 rounded-2xl p-4 text-3xl">

                                📦

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">

                                    Reporte de Productos

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    Mostrar toda la información de productos

                                </p>

                            </div>

                        </div>

                    </button>


                    {/* CATEGORÍAS */}

                    <button
                        type="button"
                        onClick={reporteCategorias}
                        disabled={cargando}
                        className="bg-white rounded-3xl shadow-xl p-8 text-left hover:shadow-2xl hover:-translate-y-1 transition-all border border-emerald-100 disabled:opacity-60 disabled:cursor-wait"
                    >

                        <div className="flex items-center gap-4">

                            <div className="bg-teal-100 text-teal-700 rounded-2xl p-4 text-3xl">

                                🗂️

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">

                                    Reporte de Categorías

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    Mostrar toda la información de categorías

                                </p>

                            </div>

                        </div>

                    </button>


                    {/* PRODUCTOS POR TEXTO */}

                    <button
                        type="button"
                        onClick={() =>
                            abrirDialogo("productos")
                        }
                        disabled={cargando}
                        className="bg-white rounded-3xl shadow-xl p-8 text-left hover:shadow-2xl hover:-translate-y-1 transition-all border border-emerald-100 disabled:opacity-60 disabled:cursor-wait"
                    >

                        <div className="flex items-center gap-4">

                            <div className="bg-green-100 text-green-700 rounded-2xl p-4 text-3xl">

                                🔎

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">

                                    Productos por texto

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    Generar reporte buscando por texto

                                </p>

                            </div>

                        </div>

                    </button>


                    {/* CATEGORÍAS POR TEXTO */}

                    <button
                        type="button"
                        onClick={() =>
                            abrirDialogo("categorias")
                        }
                        disabled={cargando}
                        className="bg-white rounded-3xl shadow-xl p-8 text-left hover:shadow-2xl hover:-translate-y-1 transition-all border border-emerald-100 disabled:opacity-60 disabled:cursor-wait"
                    >

                        <div className="flex items-center gap-4">

                            <div className="bg-lime-100 text-lime-700 rounded-2xl p-4 text-3xl">

                                🔎

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">

                                    Categorías por texto

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    Generar reporte buscando por texto

                                </p>

                            </div>

                        </div>

                    </button>

                </div>


                {/* CARGANDO */}

                {cargando && (

                    <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 text-center text-emerald-700 font-semibold">

                        Generando reporte...

                    </div>

                )}

            </div>


            {/* =================================================
                DIÁLOGO DE BÚSQUEDA
            ================================================= */}

            {mostrarDialogo && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">

                        <h2 className="text-2xl font-bold text-gray-800">

                            {tipoReporte === "productos"
                                ? "Reporte de Productos"
                                : "Reporte de Categorías"}

                        </h2>


                        <p className="text-gray-500 mt-2">

                            Ingrese una parte del texto
                            para realizar la búsqueda.

                        </p>


                        <input
                            type="text"
                            value={textoFiltro}
                            onChange={(e) =>
                                setTextoFiltro(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter"
                                ) {

                                    generarReporteFiltrado();

                                }

                            }}
                            placeholder="Ingrese el texto..."
                            className="w-full mt-5 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                        />


                        <div className="flex justify-end gap-3 mt-6">

                            <button
                                type="button"
                                onClick={cerrarDialogo}
                                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                onClick={generarReporteFiltrado}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                Generar Reporte
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Reportes;