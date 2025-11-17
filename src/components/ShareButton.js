import { supabase } from "../utils/supabase";
import React, { useState } from "react";
import { IoShareOutline, IoLogoFacebook, IoLogoWhatsapp, IoLogoTwitter } from "react-icons/io5";

const mainColor = "#d91c5c";
const lightMainColor = "#f2c1c9";

export default function SharePersonButton({ person, onShared }) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRegisterShare = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from("missing_people_shares").insert({
          missing_person_id: person.id,
          user_id: userData.user.id,
        });
        if (onShared) onShared();
      }
    } catch (err) {
      console.log("Erro ao registrar share:", err);
    }
  };

  const shareText = `🚨 Pessoa Desaparecida 🚨
Nome: ${person.nome}
Idade: ${person.idade} anos
Última localização: ${person.ultima_localizacao}
Descrição: ${person.descricao_detalhada}`;

  const pageUrl = window.location.href;

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      pageUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
    handleRegisterShare();
    setModalOpen(false);
  };

  const shareOnTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(pageUrl)}`;
    window.open(twUrl, "_blank", "width=600,height=400");
    handleRegisterShare();
    setModalOpen(false);
  };

  const shareOnWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText + " " + pageUrl
    )}`;
    window.open(waUrl, "_blank");
    handleRegisterShare();
    setModalOpen(false);
  };

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={() => setModalOpen(true)}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 6,
          borderRadius: 6,
          backgroundColor: lightMainColor,
          border: `1px solid ${mainColor}`,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Carregando..." : <IoShareOutline size={18} color={mainColor} />}
      </button>

      {/* Modal de compartilhamento */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "90%",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h2>Compartilhar pessoa desaparecida</h2>

            <button
              onClick={shareOnFacebook}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #3b5998",
                color: "#3b5998",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              <IoLogoFacebook size={20} /> Facebook
            </button>

            <button
              onClick={shareOnTwitter}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #1da1f2",
                color: "#1da1f2",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              <IoLogoTwitter size={20} /> Twitter
            </button>

            <button
              onClick={shareOnWhatsApp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #25D366",
                color: "#25D366",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              <IoLogoWhatsapp size={20} /> WhatsApp
            </button>

            <button
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: 8,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
