  import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css"; // Archivo CSS para estilos adicionales

function App() {
  const YOUTUBE_API_KEY = ""; //AQUI PONES TU API DE GOOGLE CONSOLE
  const PLAYLIST_ID = ""; //AQUI PONES EL ID DE TU PLAYLIST DE YOUTUBE

  const [videos, setVideos] = useState([]);
  const [videoActual, setVideoActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [mostrarBlur, setMostrarBlur] = useState(true);
  const [puntaje, setPuntaje] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mostrarConfeti, setMostrarConfeti] = useState(false);

  const playerRef = useRef(null);

  // Cargar fuentes de Google
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Righteous&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "snippet",
            maxResults: 50,
            playlistId: PLAYLIST_ID,
            key: YOUTUBE_API_KEY,
          },
        }
      );

      const limpiarTitulo = (titulo) => {
        return titulo.split(/,|-/)[0].trim();
      };
      
      const videoItems = res.data.items.map((item) => ({
        videoId: item.snippet.resourceId.videoId,
        title: limpiarTitulo(item.snippet.title),
      }));

      setVideos(videoItems);
      seleccionarNuevoVideo(videoItems);
    };

    fetchVideos();
  }, []);

  const seleccionarNuevoVideo = (listaVideos) => {
    const videosDisponibles = listaVideos || videos;
    if (videosDisponibles.length === 0) return;

    const videoAleatorio =
      videosDisponibles[Math.floor(Math.random() * videosDisponibles.length)];
    setVideoActual(videoAleatorio);

    let opcionesTemp = [videoAleatorio.title];
    const otrasOpciones = videosDisponibles
      .filter((v) => v.title !== videoAleatorio.title)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.title);

    opcionesTemp = opcionesTemp.concat(otrasOpciones);
    opcionesTemp.sort(() => Math.random() - 0.5);

    setOpciones(opcionesTemp);
    setMensaje("");
    setMostrarBlur(true);
  };

  useEffect(() => {
    if (videoActual) {
      window.onYouTubeIframeAPIReady = () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player("player", {
          height: "200",
          width: "350",
          videoId: videoActual.videoId,
          playerVars: {
            controls: 0,
            mute: 1,
            autoplay: 0,
          },
        });
      };

      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
  }, [videoActual]);

  const activarSonido = () => {
    if (playerRef.current && typeof playerRef.current.unMute === "function") {
      playerRef.current.unMute();
      playerRef.current.playVideo();
    }
  };

  const verificarRespuesta = (respuesta) => {
    if (respuesta === videoActual.title) {
      setMensaje("¡Correcto!");
      setPuntaje(puntaje + 10 * (combo + 1));
      setCombo(combo + 1);
      if (combo + 1 > maxCombo) setMaxCombo(combo + 1);
      
      if (combo >= 2) { // Mostrar confeti si hay combo de 3 o más
        setMostrarConfeti(true);
        setTimeout(() => setMostrarConfeti(false), 3000);
      }
    } else {
      setMensaje("Incorrecto");
      setCombo(0);
    }

    setMostrarBlur(false);

    setTimeout(() => {
      seleccionarNuevoVideo();
    }, 2000);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
  };

  const buttonTap = {
    scale: 0.95
  };

  return (
    <div className="app-container" style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "'Poppins', sans-serif",
      padding: "20px",
      textAlign: "center"
    }}>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="header"
      >
        <h1 style={{
          fontFamily: "'Righteous', cursive",
          fontSize: "3rem",
          background: "linear-gradient(90deg, #ff6b6b, #feca57, #1dd1a1, #54a0ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "10px",
          textShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>BCH</h1>
        
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginBottom: "20px"
        }}>
          <div className="score-box">
            <div className="score-label">Puntaje</div>
            <div className="score-value">{puntaje}</div>
          </div>
          
          <div className="score-box" style={{ backgroundColor: combo > 0 ? "#feca57" : "#576574" }}>
            <div className="score-label">Combo</div>
            <div className="score-value">x{combo}</div>
          </div>
          
          <div className="score-box">
            <div className="score-label">Máx. Combo</div>
            <div className="score-value">x{maxCombo}</div>
          </div>
        </div>
      </motion.div>

      {mostrarConfeti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="confetti" 
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {videoActual ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: "20px" }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              id="player"
              style={{ 
                width: "350px", 
                height: "200px",
                borderRadius: "12px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                overflow: "hidden"
              }}
            ></div>

            {mostrarBlur && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "350px",
                  height: "200px",
                  backdropFilter: "blur(12px)",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                  }}
                >
                  ¿Qué canción es?
                </motion.div>
              </motion.div>
            )}
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ marginTop: "30px", maxWidth: "600px", margin: "30px auto" }}
          >
            <div className="options-grid">
              {opciones.map((opcion, index) => (
                <motion.button
                  key={index}
                  onClick={() => verificarRespuesta(opcion)}
                  variants={itemVariants}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="option-button"
                  style={{
                    backgroundColor: getColorByIndex(index)
                  }}
                >
                  {opcion}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.button
            onClick={activarSonido}
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="sound-button"
          >
            🔊 Activar sonido
          </motion.button>

          <AnimatePresence>
            {mensaje && (
              <motion.h2
                key={mensaje}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  color: mensaje === "¡Correcto!" ? "#1dd1a1" : "#ff6b6b"
                }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{
                  fontSize: "2rem",
                  marginTop: "20px",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}
              >
                {mensaje === "¡Correcto!" ? "✅ " : "❌ "}{mensaje}
                {combo > 1 && mensaje === "¡Correcto!" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ 
                      display: "inline-block",
                      marginLeft: "10px",
                      color: "#feca57"
                    }}
                  >
                    +{10 * combo} puntos!
                  </motion.span>
                )}
              </motion.h2>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: "50px" }}
        >
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "20px" }}>Cargando videos...</p>
        </motion.div>
      )}
    </div>
  );
}

// Función auxiliar para colores de botones
function getColorByIndex(index) {
  const colors = ["#54a0ff", "#1dd1a1", "#feca57", "#ff6b6b"];
  return colors[index % colors.length];
}

export default App;
