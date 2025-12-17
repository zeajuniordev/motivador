import { useState } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

export default function Home() {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    frecuencia: 'diario'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);

    try {
      const response = await axios.post('https://ppngfk01xf.execute-api.us-east-1.amazonaws.com/Prod/registrar', form);
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
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className={styles.logoText}>Onvate</h2>
          </div>

          <div className={styles.navContainer}>
            <nav className={styles.nav}>
              <a href="#">Inicio</a>
              <a href="#">Mensajes</a>
              <a href="#">Testimonios</a>
              <a href="#">Contacto</a>
            </nav>
            <button className={styles.primaryButton}>Suscríbete</button>
          </div>
        </header>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Recibe Inspiración Diaria</h1>
            <h2>
              Suscríbete a nuestros mensajes motivacionales y comienza cada día
              con energía y positividad.
            </h2>
            <div className={styles.subscribeForm}>
              <div className={styles.inputIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                </svg>
              </div>
              <input type="email" placeholder="Tu correo electrónico" />
              <button className={styles.primaryButton}>Suscríbete</button>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className={styles.testimonials}>
          <h2>Testimonios</h2>
          <div className={styles.testimonialList}>
            <div className={styles.testimonialCard}>
              <div
                className={styles.testimonialImage}
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB5qiFWt0yvEdh6hXjb-YWE9gIZrk6Stvv6qsLHesRasny1LwudT58KavN5DxhoPsOlOLl4jjNj83v6zFYVy4KQXTuPMqv4j5vUk6bsptxvtCgFJzjKW6HoUwE2P6SioNHj1lmtWIzcNPDHBKiw_y2GAZ1empDEsdSnnqyexiMpLrLjV6i1ZIFAA4mdwjCgBKz_Pkx12ox0yQoTAxO1guFvXyArjS6akR9Hlt7_zaU4u_r4ZR6Tm2l59e7tKU_3exX2GiIi0oJJvg")',
                }}
              />
              <p>
                "Los mensajes de MotivateMe me han ayudado a mantener una
                actitud positiva y a alcanzar mis metas." - Elena
              </p>
            </div>
            <div className={styles.testimonialCard}>
              <div
                className={styles.testimonialImage}
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDVtdbihrBnyCXJFK58hQTs3rxTPHnMnF5NDg80VVtAJO_AppnQbghSMNFSpGGTiWR9djjOINT-JVXtxdGimBkSnZlH7hzPC0iqNOt9fUjqDihLqB42dF_C150EPJ-GzqrJGaxwjC0pxKxxOlm8SHBaiTT3vzASqJAEsL-6vl5ml0Hcue8b3xIsY7YGovZSTvRslf9MHSDrxLQBu_nLuRaCxPtPKVX2ut9VKwCXosS3zArB4ddtUsRc7UwyuvT6c586SncXjLhlVg")',
                }}
              />
              <p>
                "Gracias a MotivateMe, he encontrado la motivación que
                necesitaba para superar mis desafíos." - Carlos
              </p>
            </div>
            <div className={styles.testimonialCard}>
              <div
                className={styles.testimonialImage}
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBMlpz-Fb1zdltFjh9Kra4W4RWiLJ8NC97goUhKqkWVB1UUAegkfTiVnlcT63J_MNzmsyzV0CeneSMpIvxFibxLjw0P4feOxNvbXIesAG0HeQQ4mPDRCIViTgXy734hqsj4I4X7kGE9hYd3WzWunsSVE24zx-cm-Km3SePbUT2iUJuupTYWjcVKSG6ZIvcLp-z62HTOZhEo-7mv5LQZTT0E5Bud8yAjSYTuDqr9NR7K-GUrXOc5qwDe3iiFh2IcyCdzm2lnmizXNA")',
                }}
              />
              <p>
                "MotivateMe es mi dosis diaria de inspiración. ¡Lo recomiendo a
                todos!" - Sofía
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.cta}>
          <h1>¡No esperes más!</h1>
          <p>
            Suscríbete ahora y comienza a recibir mensajes que te impulsarán
            hacia el éxito.
          </p>
          <button className={styles.primaryButton}>Suscríbete</button>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <a href="#">Política de Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Contacto</a>
          </div>
          <p>© 2024 MotivateMe. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>

  );
  
}
