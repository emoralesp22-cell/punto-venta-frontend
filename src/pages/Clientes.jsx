import { useEffect, useState } from "react";
import axios from "../api/axios";

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

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const respuesta = await axios.get("/clientes");
            setClientes(respuesta.data);
        } catch (error) {
            console.error("Error al listar clientes", error);
        }
    };

    const handleChange = (e) => {
        setCliente({
            ...cliente,
            [e.target.name]: e.target.value
        });
    };

    const guardar = async (e) => {
        e.preventDefault();

        try {
            await axios.post("/clientes", {
                estado: cliente.estado,
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
            console.error("Error al guardar cliente", error);
            alert("Error al guardar cliente");
        }
    };

    return (
        <div>
            <h1>Ingresar Clientes</h1>

            <form onSubmit={guardar}>

                <div>
                    <label>Nombre: </label>
                    <input
                        type="text"
                        name="nombre"
                        value={cliente.nombre}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Apellido: </label>
                    <input
                        type="text"
                        name="apellido"
                        value={cliente.apellido}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={cliente.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Teléfono: </label>
                    <input
                        type="text"
                        name="telefono"
                        value={cliente.telefono}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Fecha de registro: </label>
                    <input
                        type="datetime-local"
                        name="fechaRegistro"
                        value={cliente.fechaRegistro}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <button type="submit">
                    Guardar
                </button>

            </form>

            <h2>Listado de Clientes</h2>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Fecha Registro</th>
                    </tr>
                </thead>

                <tbody>
                    {clientes.map((c) => (
                        <tr key={c.idCliente}>
                            <td>{c.nombre}</td>
                            <td>{c.apellido}</td>
                            <td>{c.email}</td>
                            <td>{c.telefono}</td>
                            <td>{c.fechaRegistro}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Clientes;
