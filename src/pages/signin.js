import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const mainColor = "#d91c5c";

  // Verifica se já há sessão ativa
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate("/perfil");
      }
    };
    checkSession();
  }, [navigate]);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      if (data.user) {
        navigate("/perfil");
      } else {
        alert("Usuário não encontrado.");
      }
    } catch (err) {
      console.error("Erro no Login:", err);
      alert(err?.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  // Redefinir senha
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Digite seu e-mail para redefinir a senha.");
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "https://www.vuyakaya.online/update-password",
        }
      );
      if (error) throw error;

      alert("Verifique o seu e-mail para redefinir a senha.");
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      alert(err?.message || "Erro ao enviar e-mail de redefinição.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div style={{ fontSize: "3rem", color: mainColor }}>👤</div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-600 mt-1">Faça login para continuar</p>
        </div>

        <label className="block font-semibold mb-1">E-mail</label>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          className="border rounded-lg p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block font-semibold mb-1">Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          className="border rounded-lg p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold py-2 rounded-lg"
          style={{
            backgroundColor: loading ? "#ccc" : mainColor,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Login"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="text-gray-500"
          >
            Esqueceste a senha?{" "}
            <span
              style={{ color: mainColor, fontWeight: "600", cursor: "pointer" }}
            >
              Redefinir
            </span>
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6">
          Ainda não tens conta?{" "}
          <Link
            to="/signup"
            style={{ color: mainColor, fontWeight: "600", cursor: "pointer" }}
          >
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
