import { useState } from "react";
import { supabase } from "../utils/supabase"; // sua instância configurada
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      alert("Por favor, insira o seu e-mail.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.vuyakaya.online/update-password/",
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erro ao enviar o e-mail. Tente novamente.");
    } else {
      setModalVisible(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-pink-600">Redefinir Password</h2>

        <label htmlFor="email" className="block font-semibold mb-1 text-gray-700">
          E-mail
        </label>
        <input
          type="email"
          id="email"
          placeholder="Digite o seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-pink-300 rounded-lg px-4 py-3 mb-4 w-full placeholder-gray-400 focus:ring-2 focus:ring-pink-300"
        />

        <button
          onClick={handleResetPassword}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            loading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>

        <p
          className="text-center text-pink-600 mt-4 cursor-pointer hover:underline"
          onClick={() => navigate("/signin")}
        >
          Voltar ao login
        </p>

        {/* Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-11/12 max-w-sm text-center">
              <h3 className="text-lg font-semibold mb-2">Verifique o seu e-mail</h3>
              <p className="text-gray-600 mb-6">
                Enviámos um link para redefinir a sua password. Verifique a sua caixa de
                entrada e siga as instruções.
              </p>
              <button
                onClick={() => setModalVisible(false)}
                className="bg-pink-600 py-3 rounded-lg text-white font-semibold w-full"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
