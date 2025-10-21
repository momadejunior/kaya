import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    // 1️⃣ Tenta logar com email e senha
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Pega a role do usuário no perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setMessage("❌ " + profileError.message);
      setLoading(false);
      return;
    }

    // 3️⃣ Verifica se é admin
    if (profile.role !== "admin") {
      setMessage("❌ Você não tem permissão para acessar o painel.");
      setLoading(false);
      return;
    }

    // 4️⃣ Redireciona para a dashboard
    window.location.href = "/dashboard";
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-pink-700">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-pink-600 text-white p-2 rounded hover:bg-pink-700"
        >
          {loading ? "Entrando..." : "Login"}
        </button>
        {message && <p className="mt-4 text-red-500 font-semibold">{message}</p>}
      </div>
    </div>
  );
}
