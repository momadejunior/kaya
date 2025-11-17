import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("Maputo Cidade");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const mainColor = "#d91c5c";

  // Capturar imagem do input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password || !image || !name || !phone) {
      alert("Preencha todos os campos e selecione uma foto.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Criar usuário Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: "https://www.vuyakaya.online/confirm" },
      });
      if (signUpError) throw signUpError;
      const user = signUpData.user;
      if (!user) throw new Error("Erro ao criar usuário.");

      // 2️⃣ Upload da foto
      const fileName = `avatars/${user.id}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: true,
          contentType: image.type,
        });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const avatarUrl = publicUrlData.publicUrl;

      // 3️⃣ Inserir perfil
      const { error: profileError } = await supabase.from("profiles").insert([
        { id: user.id, name, phone, location, avatar_url: avatarUrl, email },
      ]);
      if (profileError) throw profileError;

      setEmailSent(true);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setImage(null);
      setLocation("Maputo Cidade");
      alert("Conta criada! Verifique seu e-mail para confirmar o registro.");
    } catch (err) {
      console.error("Erro no SignUp:", err);
      alert(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <div style={{ fontSize: "3rem", color: mainColor }}>📧</div>
        <h2 className="text-2xl font-bold mt-4">Confirme seu e-mail</h2>
        <p className="text-gray-600 mt-2 mb-4">
          Verifique sua caixa de entrada e clique no link de confirmação.
        </p>
        <button
          onClick={() => navigate("/signin")}
          style={{
            backgroundColor: mainColor,
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          Voltar para Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: mainColor }}>
          Criar Conta
        </h1>

        <div className="flex flex-col items-center mb-4">
          <label htmlFor="photo" className="cursor-pointer">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-pink-400"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full bg-pink-200 flex items-center justify-center text-white text-3xl"
                style={{ backgroundColor: mainColor }}
              >
                📷
              </div>
            )}
          </label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <label className="block font-semibold mb-1">Nome</label>
        <input
          type="text"
          className="border rounded-lg p-2 w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block font-semibold mb-1">E-mail</label>
        <input
          type="email"
          className="border rounded-lg p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block font-semibold mb-1">Telefone</label>
        <input
          type="tel"
          className="border rounded-lg p-2 w-full mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label className="block font-semibold mb-1">Localização</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg p-2 w-full mb-3"
        >
          <option>Maputo Cidade</option>
          <option>Maputo Província</option>
          <option>Gaza</option>
          <option>Inhambane</option>
          <option>Sofala</option>
          <option>Manica</option>
          <option>Tete</option>
          <option>Zambézia</option>
          <option>Nampula</option>
          <option>Cabo Delgado</option>
          <option>Niassa</option>
        </select>

        <label className="block font-semibold mb-1">Senha</label>
        <input
          type="password"
          className="border rounded-lg p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold py-2 rounded-lg mt-2"
          style={{
            backgroundColor: loading ? "#ccc" : mainColor,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center mt-4 text-gray-600">
          Já tem uma conta?{" "}
          <span
            style={{ color: mainColor, cursor: "pointer" }}
            onClick={() => navigate("/signin")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
