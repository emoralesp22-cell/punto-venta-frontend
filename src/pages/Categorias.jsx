import { useState, useEffect } from "react";

import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria
} from "../services/categoriaService";

const formInicial = {
  idCategoria: null,
  nombre: "",
  descripcion: ""
};

function Categorias() {

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // CARGAR CATEGORIAS
  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al listar categorias", error);
    }
  };

  // CARGAR AL INICIAR
  useEffect(() => {
    cargarCategorias();
  }, []);

  // CAMBIOS EN LOS INPUTS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // GUARDAR O MODIFICAR
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let respuesta;

      if (modoEdicion) {
        respuesta = await actualizarCategoria(
          form.idCategoria,
          form
        );
      } else {
        respuesta = await crearCategoria(form);
      }

      setMensaje(respuesta.data.mensaje);
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();

    } catch (error) {
      console.error("Error al guardar categoria", error);
    }
  };

  // MODIFICAR
  const handleModificar = (categoria) => {
    setForm(categoria);
    setModoEdicion(true);
  };

  // ANULAR
  const handleAnular = async (idCategoria) => {

    const confirmar = window.confirm(
      "¿Seguro que deseas anular esta categoría?"
    );

    if (!confirmar) return;

    try {
      await anularCategoria(idCategoria);
      cargarCategorias();
    } catch (error) {
      console.error("Error al anular la categoria", error);
    }
  };

  return (
    <div>

      <h2>Ingresar/Modificar Categorías</h2>

      {mensaje && <p>{mensaje}</p>}

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="nombre">
            Nombre:
          </label>

          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="descripcion">
            Descripción:
          </label>

          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          Guardar
        </button>

      </form>

      <h2>Listado de Categorías</h2>

      <table>

        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>

        <tbody>

          {categorias.map((categoria) => (

            <tr key={categoria.idCategoria}>

              <td>
                {categoria.nombre}
              </td>

              <td>
                {categoria.descripcion}
              </td>

              <td>
                <button
                  onClick={() =>
                    handleModificar(categoria)
                  }
                >
                  Modificar
                </button>
              </td>

              <td>
                <button
                  onClick={() =>
                    handleAnular(
                      categoria.idCategoria
                    )
                  }
                >
                  Eliminar
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Categorias;
