export default function AboutApp() {
  return (
    <>
      <div
        style={{
          backgroundColor: "#f5f5f5",
          flex: 1,
          padding: 16,
          marginBottom: 6,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Card único */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderStyle: "solid",
          }}
        >
          {/* Título */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#2b3990",
              marginBottom: 24,
            }}
          >
            Vuya Kaya
          </h1>

          {/* Significado */}
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#262525",
                marginBottom: 8,
              }}
            >
              Significado
            </h2>
            <p style={{ color: "#262525", lineHeight: "22px" }}>
              Vuya Kaya significa{" "}
              <span style={{ fontWeight: "bold", color: "#f7941d" }}>
                “Volta para Casa”
              </span>
              , simbolizando o objetivo de trazer pessoas desaparecidas de volta
              para suas famílias.
            </p>
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#262525",
                marginBottom: 8,
              }}
            >
              Descrição
            </h2>
            <p style={{ color: "#262525", lineHeight: "22px" }}>
              O Vuya Kaya é um aplicativo dedicado à localização e reporte de
              pessoas desaparecidas, oferecendo uma forma rápida, segura e
              organizada de ajudar famílias e comunidades. Com ele, você pode
              registrar casos, acompanhar denúncias em tempo real e receber
              notificações importantes sobre desaparecimentos na sua região.
            </p>
          </div>

          {/* Funcionalidades */}
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#262525",
                marginBottom: 8,
              }}
            >
              Funcionalidades Principais
            </h2>

            <div style={{ marginLeft: 12, marginTop: 8 }}>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Feed de Pessoas Desaparecidas
              </p>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Reportar Pessoas Desaparecidas
              </p>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Perfil do Usuário
              </p>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Notificações em tempo real
              </p>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Estatísticas Visuais
              </p>
              <p style={{ color: "#262525", marginBottom: 4 }}>
                • Filtros e Categorias
              </p>
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#262525",
                marginBottom: 8,
              }}
            >
              Objetivo do App
            </h2>
            <p style={{ color: "#262525", lineHeight: "22px" }}>
              O Vuya Kaya tem como missão unir comunidades, autoridades e
              famílias, aumentando as chances de localizar pessoas desaparecidas
              e trazendo-as de volta para casa.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
