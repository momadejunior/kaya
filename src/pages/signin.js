import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate, Link } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5"; // ⬅ ícone novo

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const mainColor = "#d91c5c";

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate("/perfil");
      }
    };
    checkSession();
  }, [navigate]);

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
      alert(err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <IoPersonCircleOutline
            size={70}
            color={mainColor}
            className="mx-auto"
          />

          <h1 className="text-2xl font-bold mt-4 text-gray-800">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-600 mt-1">Faça login para continuar</p>
        </div>

        {/* Email */}
        <label className="block font-semibold mb-1">E-mail</label>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          className="border rounded-lg p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="block font-semibold mb-1">Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          className="border rounded-lg p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
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

        {/* Redefinir senha */}
        <div className="text-center mt-4">
          <Link to="/redefinir-password" className="text-gray-500">
            Esqueceste a senha?{" "}
            <span
              style={{
                color: mainColor,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Redefinir
            </span>
          </Link>
        </div>

        {/* Criar conta */}
        <p className="text-center text-gray-500 mt-6">
          Ainda não tens conta?{" "}
          <Link
            to="/signup"
            style={{ color: mainColor, fontWeight: "600" }}
          >
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
