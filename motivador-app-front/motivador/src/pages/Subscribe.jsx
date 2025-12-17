import { useState } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

export default function Subscribe() {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    frecuencia: 'diario'
  });
  // Base de la API configurable via Vite env vars (VITE_API_BASE). Usamos
  // el valor definido en build/dev y caemos al endpoint deployado por defecto.
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://ppngfk01xf.execute-api.us-east-1.amazonaws.com/Prod';
  const REGISTER_ENDPOINT = `${API_BASE.replace(/\/$/, '')}/registrar`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);

    try {
      const response = await axios.post(REGISTER_ENDPOINT, form);
      alert(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("El correo ya está registrado.");
      } else {
        alert("Error al registrar.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h1 className={styles.title}>Suscríbete para recibir mensajes motivacionales ✨</h1>
  
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nombre:
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>
  
          <label>
            Correo electrónico:
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </label>
  
          <label>
            Frecuencia:
            <select name="frecuencia" value={form.frecuencia} onChange={handleChange}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
            </select>
          </label>
  
          <button type="submit">Suscribirme</button>
        </form>
      </div>
    </div>
  );
  
}
