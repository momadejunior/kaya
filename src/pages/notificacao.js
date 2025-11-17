import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";

export default function Notificacoes() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  const fetchMissingPeople = async () => {
    if (cleared) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("missing_people")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erro: Não foi possível carregar os registros.");
      console.error(error);
    } else {
      setPeople(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMissingPeople();
  }, []);

  const clearRecords = () => {
    const confirmClear = window.confirm(
      "Deseja realmente limpar os registros da tela?"
    );
    if (confirmClear) {
      setPeople([]);
      setCleared(true);
    }
  };

  if (loading)
    return (
      <div
        style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <p style={{ color: "#d91c5c" }}>Carregando...</p>
      </div>
    );

  if (people.length === 0 || cleared)
    return (
      <div
        style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <p style={{ color: "#999" }}>Nenhuma notificação disponível</p>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "Ativo":
        return "#28a745";
      case "Encerrada":
        return "#dc3545";
      case "Encontrada":
        return "#007bff";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <button
        onClick={clearRecords}
        style={{
          padding: 10,
          backgroundColor: "#d91c5c",
          margin: 16,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          color: "#fff",
          fontWeight: "bold",
          width: "calc(100% - 32px)",
        }}
      >
        Limpar Notificações
      </button>

      <div style={{ padding: 16 }}>
        {people.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 12,
              backgroundColor: "#fff",
              borderRadius: 8,
              marginBottom: 12,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            {/* Foto */}
            {item.photo_url ? (
              <img
                src={item.photo_url}
                alt="Foto"
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: "#eee",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#999", fontSize: 12 }}>Sem Foto</span>
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: 16, margin: 0 }}>
                  {item.nome}
                </p>

                <div
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    backgroundColor: getStatusColor(item.status),
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {item.status ?? "Desconhecido"}
                  </span>
                </div>
              </div>

              {item.descricao_detalhada && (
                <p style={{ marginTop: 4 }}>{item.descricao_detalhada}</p>
              )}

              <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {item.idade ? `${item.idade} anos, ` : ""}
                {item.genero ?? ""}
              </p>

              <p style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                {item.ultima_localizacao ?? "Localização não informada"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
