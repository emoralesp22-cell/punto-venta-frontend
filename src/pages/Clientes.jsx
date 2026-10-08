import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

function Clientes() {

    const navigate = useNavigate();

    const formInicial = {
        idCliente: null,
        estado: true,
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fechaRegistro: ""
    };

    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState(formInicial);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const cargarClientes = async () => {

        try {

            const respuesta = await axios.get(
                "http://localhost:8080/clientes/activos"
            );

            setClientes(respuesta.data || []);

        } catch (error) {

            console.error(
                "Error al listar clientes:",
                error
            );

        }

    };

    useEffect(() => {

        cargarClientes();

    }, []);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const guardarCliente = async (e) => {

        e.preventDefault();

        try {

            const datos = {

                estado: true,

                nombre: form.nombre,

                apellido: form.apellido,

                email: form.email,

                telefono: form.telefono,

                fechaRegistro: form.fechaRegistro

            };

            if (modoEdicion) {

                await axios.put(
                    `http://localhost:8080/clientes/${form.idCliente}`,
                    datos
                );

                setMensaje(
                    "Cliente actualizado correctamente."
                );

            } else {

                await axios.post(
                    "http://localhost:8080/clientes",
                    datos
                );

                setMensaje(
                    "Cliente guardado correctamente."
                );

            }

            setForm(formInicial);
            setModoEdicion(false);

            await cargarClientes();

            setTimeout(() => {

                setMensaje("");

            }, 3000);

        } catch (error) {

            console.error(
                "Error al guardar/actualizar cliente:",
                error
            );

            setMensaje(
                "Error al guardar o actualizar el cliente."
            );

        }

    };

    const editarCliente = (cliente) => {

        let fecha =
            cliente.fechaRegistro || "";

        if (
            fecha &&
            fecha.length > 16
        ) {

            fecha =
                fecha.substring(0, 16);

        }

        setForm({

            idCliente:
                cliente.idCliente ||
                cliente.id,

            estado:
                cliente.estado ?? true,

            nombre:
                cliente.nombre || "",

            apellido:
                cliente.apellido || "",

            email:
                cliente.email || "",

            telefono:
                cliente.telefono || "",

            fechaRegistro:
                fecha

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

    const anularCliente = async (id) => {

        const confirmar =
            window.confirm(
                "¿Estás seguro de que deseas anular este cliente?"
            );

        if (!confirmar) {

            return;

        }

        try {

            await axios.put(
                `http://localhost:8080/clientes/anular/${id}`
            );

            setMensaje(
                "Cliente anulado correctamente."
            );

            await cargarClientes();

            setTimeout(() => {

                setMensaje("");

            }, 3000);

        } catch (error) {

            console.error(
                "Error al anular cliente:",
                error
            );

            setMensaje(
                "No se pudo anular el cliente."
            );

        }

    };

    // =========================
    // PDF
    // =========================

    const generarPDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(18);

        doc.text(
            "Listado de Clientes",
            14,
            20
        );

        doc.setFontSize(10);

        doc.text(
            `Fecha: ${new Date().toLocaleString()}`,
            14,
            28
        );

        const datos =
            clientes.map(
                (cliente) => [

                    `${cliente.nombre || ""} ${cliente.apellido || ""}`,

                    cliente.email || "",

                    cliente.telefono || "",

                    cliente.fechaRegistro
                        ? new Date(
                            cliente.fechaRegistro
                        ).toLocaleString()
                        : ""

                ]
            );

        autoTable(doc, {

            startY: 35,

            head: [[

                "Nombre",

                "Email",

                "Teléfono",

                "Registro"

            ]],

            body: datos,

            headStyles: {

                fillColor: [
                    16,
                    185,
                    129
                ]

            },

            alternateRowStyles: {

                fillColor: [
                    236,
                    253,
                    245
                ]

            }

        });

        return doc;

    };

    const exportarPDF = () => {

        const doc =
            generarPDF();

        doc.save(
            "Listado_de_Clientes.pdf"
        );

    };

    const verPDF = () => {

        const doc =
            generarPDF();

        const blob =
            doc.output("blob");

        const url =
            URL.createObjectURL(blob);

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
                "Clientes"
            );

        worksheet.columns = [

            {
                header: "Nombre",
                key: "nombre",
                width: 30
            },

            {
                header: "Email",
                key: "email",
                width: 35
            },

            {
                header: "Teléfono",
                key: "telefono",
                width: 20
            },

            {
                header: "Registro",
                key: "registro",
                width: 25
            }

        ];

        clientes.forEach(
            (cliente) => {

                worksheet.addRow({

                    nombre:
                        `${cliente.nombre || ""} ${cliente.apellido || ""}`,

                    email:
                        cliente.email || "",

                    telefono:
                        cliente.telefono || "",

                    registro:
                        cliente.fechaRegistro
                            ? new Date(
                                cliente.fechaRegistro
                            ).toLocaleString()
                            : ""

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

        worksheet.getRow(1).alignment = {

            vertical: "middle",

            horizontal: "center"

        };

        const buffer =
            await workbook.xlsx.writeBuffer();

        const blob =
            new Blob(
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
            "Listado_de_Clientes.xlsx";

        enlace.click();

        URL.revokeObjectURL(url);

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 p-4 md:p-8">

            <div className="max-w-7xl mx-auto">

                {/* ENCABEZADO */}

                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                            <div className="flex items-center gap-3 mb-2">

                                <div className="bg-emerald-400 rounded-2xl p-3 text-2xl">

                                    👥

                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold">

                                    Gestión de Clientes

                                </h1>

                            </div>

                            <p className="text-emerald-100">

                                Administra los clientes de tu punto de venta

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

                            <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center">

                                <p className="text-emerald-100 text-sm">

                                    Clientes activos

                                </p>

                                <p className="text-3xl font-bold">

                                    {clientes.length}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {mensaje && (

                    <div className="mb-6 bg-emerald-100 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-2xl font-semibold shadow">

                        {mensaje}

                    </div>

                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* FORMULARIO */}

                    <div className="lg:col-span-4">

                        <div className="bg-emerald-50 rounded-3xl shadow-xl overflow-hidden">

                            <div className="bg-emerald-800 text-white p-5">

                                <h2 className="text-xl font-bold">

                                    {modoEdicion
                                        ? "✏️ Editar Cliente"
                                        : "➕ Registrar Cliente"}

                                </h2>

                                <p className="text-emerald-100 text-sm mt-1">

                                    {modoEdicion
                                        ? "Modifica la información del cliente"
                                        : "Ingresa la información del cliente"}

                                </p>

                            </div>

                            <form
                                onSubmit={guardarCliente}
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
                                        placeholder="Nombre"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">

                                        Apellido

                                    </label>

                                    <input
                                        type="text"
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Apellido"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">

                                        Email

                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="correo@ejemplo.com"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">

                                        Teléfono

                                    </label>

                                    <input
                                        type="text"
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Teléfono"
                                    />

                                </div>

                                <div>

                                    <label className="block text-sm font-semibold text-emerald-900 mb-2">

                                        Fecha de registro

                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="fechaRegistro"
                                        value={form.fechaRegistro}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
                                >

                                    {modoEdicion
                                        ? "💾 Actualizar Cliente"
                                        : "💾 Guardar Cliente"}

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

                                            📋 Listado de Clientes

                                        </h2>

                                        <p className="text-emerald-100 text-sm">

                                            Clientes activos registrados

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
                                                Nombre
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Email
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Teléfono
                                            </th>

                                            <th className="px-4 py-4 text-left">
                                                Registro
                                            </th>

                                            <th className="px-4 py-4 text-center">
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {clientes.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    className="text-center py-10 text-emerald-700"
                                                >
                                                    No hay clientes activos registrados.
                                                </td>

                                            </tr>

                                        ) : (

                                            clientes.map(
                                                (cliente, index) => {

                                                    const idCliente =
                                                        cliente.idCliente ||
                                                        cliente.id;

                                                    return (

                                                        <tr
                                                            key={
                                                                idCliente ||
                                                                index
                                                            }
                                                            className={
                                                                index % 2 === 0
                                                                    ? "bg-white hover:bg-emerald-100 transition"
                                                                    : "bg-emerald-50 hover:bg-emerald-100 transition"
                                                            }
                                                        >

                                                            <td className="px-4 py-4 font-semibold text-emerald-950">

                                                                {cliente.nombre}{" "}

                                                                {cliente.apellido}

                                                            </td>

                                                            <td className="px-4 py-4 text-gray-700">

                                                                {cliente.email || "—"}

                                                            </td>

                                                            <td className="px-4 py-4 text-gray-700">

                                                                {cliente.telefono || "—"}

                                                            </td>

                                                            <td className="px-4 py-4 text-gray-700">

                                                                {cliente.fechaRegistro
                                                                    ? new Date(
                                                                        cliente.fechaRegistro
                                                                    ).toLocaleString()
                                                                    : "—"}

                                                            </td>

                                                            <td className="px-4 py-4">

                                                                <div className="flex flex-col sm:flex-row justify-center gap-2">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            editarCliente(
                                                                                cliente
                                                                            )
                                                                        }
                                                                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-semibold transition"
                                                                    >
                                                                        ✏️ Editar
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            anularCliente(
                                                                                idCliente
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

                                                }
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="bg-emerald-100/70 px-5 py-4 text-sm text-emerald-800">

                                Total de clientes activos:{" "}

                                <strong>

                                    {clientes.length}

                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Clientes;