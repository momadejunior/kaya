// src/pages/perfil/EditarPerfil.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";

const theme = {
  colors: {
    primary: "#2b3990",
    background: "#f5f5f5",
    text: "#1a1a1a",
    disabled: "#aaaaaa",
  },
};

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { id: userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        alert("Erro: ID do usuário não definido.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.log("Erro ao buscar perfil:", error);
          alert("Não foi possível carregar o perfil.");
        } else if (data) {
          setProfile(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
        }
      } catch (err) {
        console.log("Erro inesperado:", err);
        alert("Ocorreu um erro inesperado ao buscar o perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, phone, location })
        .eq("id", userId);

      if (error) {
        console.log("Erro ao salvar perfil:", error);
        alert("Não foi possível salvar o perfil.");
      } else {
        alert("Perfil atualizado!");
        navigate("/perfil");
      }
    } catch (err) {
      console.log("Erro inesperado ao salvar:", err);
      alert("Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: theme.colors.background,
        }}
      >
        <div className="loader" />
        <p
          style={{
            marginTop: 8,
            color: theme.colors.primary,
            fontWeight: 600,
          }}
        >
          Carregando perfil...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        background: theme.colors.background,
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: theme.colors.primary,
          marginBottom: 24,
        }}
      >
        Editar Perfil
      </h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: theme.colors.text, marginBottom: 4 }}>
          Nome
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ color: theme.colors.text, marginBottom: 4 }}>
          Telefone
        </label>
        <input
          value={phone}
          type="tel"
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: theme.colors.text, marginBottom: 4 }}>
          Localização
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: 16,
          width: "100%",
          borderRadius: 12,
          background: "#da1c5c",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
          border: "none",
          cursor: "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
