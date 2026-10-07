import { useEffect, useState } from "react";
import axios from "axios";

function Clientes() {

    const [clientes, setClientes] = useState([]);

    const [cliente, setCliente] = useState({
        estado: true,
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fechaRegistro: ""
    });

    const cargarClientes = async () => {
        try {
            const respuesta = await axios.get(
                "http://localhost:8080/clientes"
            );
            setClientes(respuesta.data);
        } catch (error) {
            console.error("Error al listar clientes:", error);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const handleChange = (e) => {
        setCliente({
            ...cliente,
            [e.target.name]: e.target.value
        });
    };

    const guardar = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8080/clientes", {
                estado: true,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                email: cliente.email,
                telefono: cliente.telefono,
                fechaRegistro: cliente.fechaRegistro
            });

            alert("Cliente guardado correctamente");

            setCliente({
                estado: true,
                nombre: "",
                apellido: "",
                email: "",
                telefono: "",
                fechaRegistro: ""
            });

            cargarClientes();

        } catch (error) {
            console.error("Error al guardar cliente:", error);
            alert("Error al guardar cliente");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">

            {/* ENCABEZADO */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Gestión de Clientes
                </h1>

                <p className="mt-1 text-slate-500">
                    Registra y administra los clientes del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* FORMULARIO */}
                <div className="rounded-2xl bg-white p-6 shadow-lg">

                    <h2 className="mb-6 text-xl font-bold text-slate-700">
                        Nuevo Cliente
                    </h2>

                    <form onSubmit={guardar} className="space-y-4">

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Nombre
                            </label>

                            <input
                                type="text"
                                name="nombre"
                                value={cliente.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del cliente"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Apellido
                            </label>

                            <input
                                type="text"
                                name="apellido"
                                value={cliente.apellido}
                                onChange={handleChange}
                                placeholder="Apellido del cliente"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={cliente.email}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Teléfono
                            </label>

                            <input
                                type="text"
                                name="telefono"
                                value={cliente.telefono}
                                onChange={handleChange}
                                placeholder="12345678"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                                Fecha de registro
                            </label>

                            <input
                                type="datetime-local"
                                name="fechaRegistro"
                                value={cliente.fechaRegistro}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                            + Guardar Cliente
                        </button>

                    </form>
                </div>

                {/* LISTADO */}
                <div className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-slate-700">
                                Listado de Clientes
                            </h2>

                            <p className="text-sm text-slate-500">
                                Clientes registrados en el sistema
                            </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                            {clientes.length} clientes
                        </span>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Apellido</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Teléfono</th>
                                    <th className="px-4 py-3">Registro</th>
                                </tr>
                            </thead>

                            <tbody>

                                {clientes.map((c) => (

                                    <tr
                                        key={c.idCliente}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >

                                        <td className="px-4 py-4 font-semibold text-slate-700">
                                            {c.nombre}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {c.apellido}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500">
                                            {c.email}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {c.telefono}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                {c.fechaRegistro}
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

export default Clientes;