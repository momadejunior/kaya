"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase"; // cliente clássico

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  // 🔹 Extrai o token da URL (hash)
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token) {
      setTokenValid(true);
      // seta a sessão temporária
      supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || "",
      });
    }
  }, []);

  // 🔹 Função para atualizar senha
  const handleUpdatePassword = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("❌ Erro ao atualizar senha: " + error.message);
    } else {
      setMessage("✅ Senha atualizada com sucesso! Pode agora fazer login.");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }} className="text-pink-700">Redefinir Senha</h1>

        {tokenValid ? (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #ccc",color: "#000" }}
            />
            <button
              onClick={handleUpdatePassword}
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
            className="bg-pink-600">
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </>
        ) : (
          <p>Token inválido ou expirado. Solicite um novo link de recuperação.</p>
        )}

        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </div>
  );
}
